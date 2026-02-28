from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib import messages

from .models import Post
from interactions.models import Like, Comment, CommentLike
from accounts.models import Notification, FriendRequest


@login_required
def feed(request):
    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        if content:
            post = Post.objects.create(author=request.user, content=content)
            
            # Envoyer des notifications aux amis
            friends_ids = list(request.user.friends.values_list('id', flat=True))
            for friend_id in friends_ids:
                Notification.objects.create(
                    recipient_id=friend_id,
                    sender=request.user,
                    notification_type='new_post',
                    message=f"{request.user.username} a publié quelque chose de nouveau",
                    link=f"/feed/"
                )
            
            messages.success(request, "Publication postée !")
        else:
            messages.error(request, "Le contenu ne peut pas être vide.")
        return redirect('fils_actualite')

    posts_list = Post.objects.all().order_by('-created_at')
    
    # Ajouter les infos de like pour chaque post
    for post in posts_list:
        post.is_liked = post.like_set.filter(user=request.user).exists()
        post.likers = list(post.like_set.select_related('user').values('user__id', 'user__username'))
        post.comments_list = post.comments.all()
        for comment in post.comments_list:
            comment.is_liked = comment.likes.filter(user=request.user).exists()
            comment.likers = list(comment.likes.select_related('user').values('user__id', 'user__username'))
        
        # Ajouter les infos de demande d'ami
        post.is_friend = post.author in request.user.friends
        
        post.has_pending_request = FriendRequest.objects.filter(
            from_user=request.user, 
            to_user=post.author, 
            status='pending'
        ).exists()
        
        post.has_received_request = FriendRequest.objects.filter(
            from_user=post.author,
            to_user=request.user,
            status='pending'
        ).exists()

    paginator = Paginator(posts_list, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'user': request.user,
    }
    return render(request, 'feed.html', context)


@login_required
@require_POST
def toggle_like(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)

        if not created:
            like.delete()
            liked = False
        else:
            liked = True
            #Notifier l'auteur du post
            if post.author != request.user:
                Notification.objects.create(
                    recipient=post.author,
                    sender=request.user,
                    notification_type='like',
                    message=f"{request.user.username} a liké votre publication",
                    link=f"/feed/"
                )

        likers = list(post.like_set.select_related('user').values('user__id', 'user__username'))

        return JsonResponse({
            'success': True,
            'liked': liked,
            'likes_count': post.like_set.count(),
            'likers': likers
        })
    except Post.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Post non trouvé'}, status=404)


@login_required
@require_POST
def add_comment(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        content = request.POST.get('content', '').strip()

        if not content:
            return JsonResponse({'success': False, 'error': 'Commentaire vide'})

        comment = Comment.objects.create(
            post=post,
            author=request.user,
            content=content
        )
        
        #Notifier l'auteur du post
        if post.author != request.user:
            Notification.objects.create(
                recipient=post.author,
                sender=request.user,
                notification_type='comment',
                message=f"{request.user.username} a commenté votre publication",
                link=f"/feed/"
            )

        return JsonResponse({
            'success': True,
            'comment': {
                'id': comment.id,
                'author': comment.author.username,
                'content': comment.content,
                'created_at': comment.created_at.strftime("%d/%m/%Y %H:%M"),
                'likes_count': 0,
                'is_liked': False,
                'likers': []
            }
        })
    except Post.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Post non trouvé'}, status=404)


@login_required
@require_POST
def repost(request, post_id):
    try:
        original_post = Post.objects.get(id=post_id)

        new_post = Post.objects.create(
            author=request.user,
            content=f"{original_post.content}\n\n— Repost de @{original_post.author.username}",
        )

        return JsonResponse({
            'success': True,
            'message': 'Publication repostée !',
            'new_post_id': new_post.id
        })
    except Post.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Publication originale non trouvée'}, status=404)


@login_required
@require_POST
def toggle_comment_like(request, comment_id):
    try:
        comment = Comment.objects.get(id=comment_id)
        comment_like, created = CommentLike.objects.get_or_create(user=request.user, comment=comment)

        if not created:
            comment_like.delete()
            liked = False
        else:
            liked = True

        likers = list(comment.likes.select_related('user').values('user__id', 'user__username'))

        return JsonResponse({
            'success': True,
            'liked': liked,
            'likes_count': comment.total_likes,
            'likers': likers
        })
    except Comment.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Commentaire non trouvé'}, status=404)

