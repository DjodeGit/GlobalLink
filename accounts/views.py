from django.shortcuts import redirect, render, get_object_or_404
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.views.generic import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db.models import Q
from django.utils import timezone

from .forms import CustomUserCreationForm, ProfileUpdateForm
from .models import CustomUser, FriendRequest, Notification, Message
from posts.models import Post
from interactions.models import Like, Comment


def signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('feed')
    else:
        form = CustomUserCreationForm()

    return render(request, 'registration/signup.html', {'form': form})


class ProfileDetailView(LoginRequiredMixin, View):
    template_name = 'registration/profile.html'
    context_object_name = 'profile_user'

    def get(self, request, user_id=None):
        if user_id:
            self.object = get_object_or_404(CustomUser, pk=user_id)
        else:
            self.object = request.user
        context = self.get_context_data()
        return render(request, self.template_name, context)

    def get_context_data(self):
        context = {}
        user = self.object
        context[self.context_object_name] = user
        context['total_posts'] = user.total_posts
        context['total_likes_received'] = user.total_likes_received

        posts_list = Post.objects.filter(author=user).order_by('-created_at')

        if self.request.user.is_authenticated:
            for post in posts_list:
                post.is_liked = post.like_set.filter(user=self.request.user).exists()
                post.likers = list(post.like_set.select_related('user').values('user__id', 'user__username'))
                for comment in post.comments.all():
                    comment.is_liked = comment.likes.filter(user=self.request.user).exists()
                    comment.likers = list(comment.likes.select_related('user').values('user__id', 'user__username'))

        context['is_friend'] = user in self.request.user.friends
        context['has_pending_request'] = FriendRequest.objects.filter(
            from_user=self.request.user, 
            to_user=user, 
            status='pending'
        ).exists()
        context['has_received_request'] = FriendRequest.objects.filter(
            from_user=user,
            to_user=self.request.user,
            status='pending'
        ).exists()

        paginator = Paginator(posts_list, 10)
        page_number = self.request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context['page_obj'] = page_obj
        context['posts'] = page_obj.object_list
        context['active_tab'] = self.request.GET.get('tab', 'publications')

        return context


class ProfileEditView(LoginRequiredMixin, View):
    template_name = 'registration/profile_edit.html'

    def get(self, request):
        form = ProfileUpdateForm(instance=request.user)
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Votre profil a été mis à jour avec succès!')
            return redirect('my_profile')
        return render(request, self.template_name, {'form': form})


@login_required
def search_users(request):
    query = request.GET.get('q', '')
    if query:
        users = CustomUser.objects.filter(
            Q(username__icontains=query) | 
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).exclude(id=request.user.id)[:20]
    else:
        users = []
    
    results = []
    for user in users:
        is_friend = user in request.user.friends
        
        pending_request = FriendRequest.objects.filter(
            from_user=request.user, 
            to_user=user, 
            status='pending'
        ).first()
        
        received_request = FriendRequest.objects.filter(
            from_user=user,
            to_user=request.user,
            status='pending'
        ).first()
        
        results.append({
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'photo': user.photo.url if user.photo else None,
            'is_friend': is_friend,
            'has_pending_request': pending_request is not None,
            'has_received_request': received_request is not None,
            'pending_request_id': pending_request.id if pending_request else None,
        })
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'users': results, 'query': query})
    
    return render(request, 'feed.html', {'search_results': results, 'search_query': query})


@login_required
@require_POST
def send_friend_request(request, user_id):
    to_user = get_object_or_404(CustomUser, pk=user_id)
    
    if to_user == request.user:
        return JsonResponse({'success': False, 'error': 'Vous ne pouvez pas vous ajouter vous-même'})
    
    existing_request = FriendRequest.objects.filter(
        from_user=request.user,
        to_user=to_user,
        status='pending'
    ).first()
    
    if existing_request:
        return JsonResponse({'success': False, 'error': 'Demande déjà envoyée'})
    
    if to_user in request.user.friends:
        return JsonResponse({'success': False, 'error': 'Vous êtes déjà amis'})
    
    friend_request = FriendRequest.objects.create(
        from_user=request.user,
        to_user=to_user
    )
    
    Notification.objects.create(
        recipient=to_user,
        sender=request.user,
        notification_type='friend_request',
        message=f"{request.user.username} vous a envoyé une demande d'ami",
        link=f"/accounts/profile/{request.user.id}/"
    )
    
    return JsonResponse({
        'success': True, 
        'message': 'Demande d\'ami envoyée !',
        'request_id': friend_request.id
    })


@login_required
@require_POST
def accept_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, pk=request_id, to_user=request.user)
    
    if friend_request.status != 'pending':
        return JsonResponse({'success': False, 'error': 'Demande déjà traitée'})
    
    friend_request.status = 'accepted'
    friend_request.save()
    
    # Créer une notification pour l'expéditeur de la demande
    Notification.objects.create(
        recipient=friend_request.from_user,
        sender=request.user,
        notification_type='friend_accepted',
        message=f"{request.user.username} a accepté votre demande d'ami",
        link=f"/accounts/profile/{request.user.id}/"
    )
    
    return JsonResponse({
        'success': True, 
        'message': 'Demande d\'ami acceptée !'
    })


@login_required
@require_POST
def reject_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, pk=request_id, to_user=request.user)
    
    if friend_request.status != 'pending':
        return JsonResponse({'success': False, 'error': 'Demande déjà traitée'})
    
    friend_request.status = 'rejected'
    friend_request.save()
    
    return JsonResponse({
        'success': True, 
        'message': 'Demande d\'ami refusée'
    })


@login_required
def received_friend_requests(request):
    """Affiche les demandes d'ami reçues par l'utilisateur"""
    received_requests = FriendRequest.objects.filter(
        to_user=request.user, 
        status='pending'
    ).select_related('from_user')
    
    return render(request, 'registration/friend_requests.html', {
        'received_requests': received_requests
    })


@login_required
def get_notifications(request):
    notifications = Notification.objects.filter(recipient=request.user)[:50]
    
    data = []
    for notif in notifications:
        data.append({
            'id': notif.id,
            'sender': notif.sender.username,
            'sender_photo': notif.sender.photo.url if notif.sender.photo else None,
            'type': notif.notification_type,
            'message': notif.message,
            'link': notif.link,
            'is_read': notif.is_read,
            'created_at': notif.created_at.strftime('%d/%m/%Y %H:%M')
        })
    
    return JsonResponse({
        'notifications': data,
        'unread_count': request.user.unread_notifications_count
    })


@login_required
@require_POST
def mark_notification_read(request, notification_id):
    notification = get_object_or_404(Notification, pk=notification_id, recipient=request.user)
    notification.is_read = True
    notification.save()
    
    return JsonResponse({'success': True})


@login_required
@require_POST
def mark_all_notifications_read(request):
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    
    return JsonResponse({'success': True})


@login_required
def messages_view(request):
    friends = request.user.friends
    
    conversations = []
    for friend in friends:
        last_message = Message.objects.filter(
            Q(sender=request.user, recipient=friend) | 
            Q(sender=friend, recipient=request.user)
        ).first()
        
        unread_count = Message.objects.filter(
            sender=friend, 
            recipient=request.user, 
            is_read=False
        ).count()
        
        conversations.append({
            'friend': friend,
            'last_message': last_message,
            'unread_count': unread_count
        })
    
    conversations = sorted(conversations, key=lambda x: x['last_message'].created_at if x['last_message'] else timezone.now(), reverse=True)
    
    return render(request, 'registration/messages.html', {'conversations': conversations})


@login_required
def conversation_view(request, user_id):
    friend = get_object_or_404(CustomUser, pk=user_id)
    
    if friend not in request.user.friends:
        messages.error(request, "Vous devez être ami pour envoyer des messages")
        return redirect('messages')
    
    Message.objects.filter(sender=friend, recipient=request.user, is_read=False).update(is_read=True)
    
    messages_list = Message.objects.filter(
        Q(sender=request.user, recipient=friend) | 
        Q(sender=friend, recipient=request.user)
    ).order_by('created_at')
    
    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        if content:
            Message.objects.create(
                sender=request.user,
                recipient=friend,
                content=content
            )
            Notification.objects.create(
                recipient=friend,
                sender=request.user,
                notification_type='message',
                message=f"{request.user.username} vous a envoyé un message",
                link=f"/messages/{request.user.id}/"
            )
            return redirect('conversation', user_id=friend.id)
    
    return render(request, 'registration/conversation.html', {
        'friend': friend,
        'messages': messages_list
    })


@login_required
@require_POST
def send_message(request, user_id):
    recipient = get_object_or_404(CustomUser, pk=user_id)
    
    if recipient not in request.user.friends:
        return JsonResponse({'success': False, 'error': 'Vous devez être ami pour envoyer des messages'})
    
    content = request.POST.get('content', '').strip()
    if not content:
        return JsonResponse({'success': False, 'error': 'Le message ne peut pas être vide'})
    
    message = Message.objects.create(
        sender=request.user,
        recipient=recipient,
        content=content
    )
    
    Notification.objects.create(
        recipient=recipient,
        sender=request.user,
        notification_type='message',
        message=f"{request.user.username} vous a envoyé un message",
        link=f"/messages/{request.user.id}/"
    )
    
    return JsonResponse({
        'success': True,
        'message': {
            'id': message.id,
            'content': message.content,
            'created_at': message.created_at.strftime('%d/%m/%Y %H:%M'),
            'is_mine': True
        }
    })

