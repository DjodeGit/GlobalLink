from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView
from accounts.views import signup
from posts.views import feed  # Import the feed view from posts app
from posts.views import toggle_like, add_comment,repost


urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentification (utilise les vues par défaut de Django)
    path('accounts/login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
    path('accounts/signup/', signup, name='signup'),
    path('accounts/profile/', TemplateView.as_view(template_name='registration/profile.html'), name='profile'),
    # Page d’accueil / fil d’actualité (temporaire)
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    # path('feed/', TemplateView.as_view(template_name='feed.html'), name='fils_actualite'),
    path('feed/', feed, name='fils_actualite'),  # Ensure 'feed' is defined in accounts.views
    
    path('posts/like/<int:post_id>/', toggle_like, name='toggle_like'),
    path('posts/comment/add/<int:post_id>/', add_comment, name='add_comment'),
    path('posts/repost/<int:post_id>/', repost, name='repost'), 
]