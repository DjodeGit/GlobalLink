from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from .models import Post
from django.contrib import messages

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from interactions.models import Like, Comment


@login_required
def feed(request):
    if request.method == 'POST':
        content = request.POST.get('content')
        if content and len(content.strip()) > 0:
            Post.objects.create(author=request.user, content=content)
            messages.success(request, "Publication postée !")
        else:
            messages.error(request, "Le contenu ne peut pas être vide.")
        return redirect('fils_actualite')

    posts_list = Post.objects.all().order_by('-created_at')

    # Ajout : on pré-calcule si l'utilisateur actuel a liké chaque post
    for post in posts_list:
        post.is_liked = post.like_set.filter(user=request.user).exists()

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
    post = Post.objects.get(id=post_id)
    like, created = Like.objects.get_or_create(user=request.user, post=post)

    if not created:
        like.delete()
        liked = False
    else:
        liked = True

    return JsonResponse({
        'liked': liked,
        'likes_count': post.like_set.count()
    })


@login_required
@require_POST
def add_comment(request, post_id):
    post = Post.objects.get(id=post_id)
    content = request.POST.get('content', '').strip()

    if not content:
        return JsonResponse({'success': False, 'error': 'Commentaire vide'})

    comment = Comment.objects.create(post=post, author=request.user, content=content)

    return JsonResponse({
        'success': True,
        'comment': {
            'author': comment.author.username,
            'content': comment.content,
            'created_at': comment.created_at.strftime("%d/%m/%Y %H:%M")
        }
    })


def share_post(request, post_id):
    post = Post.objects.get(id=post_id)
    post_url = request.build_absolute_uri(reverse('post_detail', args=[post.id]))  # À créer plus tard
    return JsonResponse({'share_url': post_url})



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

        return JsonResponse({
            'success': True,
            'liked': liked,
            'likes_count': post.like_set.count()
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

        return JsonResponse({
            'success': True,
            'comment': {
                'author': comment.author.username,
                'content': comment.content,
                'created_at': comment.created_at.strftime("%d/%m/%Y %H:%M")
            }
        })
    except Post.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Post non trouvé'}, status=404)


@login_required
@require_POST
def share_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        # URL absolue du post (tu peux créer une page détail plus tard)
        post_url = request.build_absolute_uri(f'/post/{post.id}/')
        return JsonResponse({'success': True, 'share_url': post_url})
    except Post.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Post non trouvé'}, status=404)