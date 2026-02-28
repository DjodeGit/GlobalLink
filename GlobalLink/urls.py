from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

from accounts.views import (
    signup, ProfileDetailView, ProfileEditView, 
    search_users, send_friend_request, accept_friend_request, reject_friend_request,
    get_notifications, mark_notification_read, mark_all_notifications_read,
    messages_view, conversation_view, send_message, received_friend_requests
)
from posts.views import feed, toggle_like, add_comment, repost, toggle_comment_like


urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentification
    path('accounts/login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
    path('accounts/signup/', signup, name='signup'),
    path('accounts/profile/<int:user_id>/', ProfileDetailView.as_view(), name='profile'),
    path('accounts/profile/', ProfileDetailView.as_view(), name='my_profile'),
    path('accounts/profile/edit/', ProfileEditView.as_view(), name='profile_edit'),
    
    # Recherche d'utilisateurs
    path('accounts/search/', search_users, name='search_users'),
    
    # Demandes d'ami
    path('accounts/friend/requests/', received_friend_requests, name='received_friend_requests'),
    path('accounts/friend/request/<int:user_id>/', send_friend_request, name='send_friend_request'),
    path('accounts/friend/accept/<int:request_id>/', accept_friend_request, name='accept_friend_request'),
    path('accounts/friend/reject/<int:request_id>/', reject_friend_request, name='reject_friend_request'),
    
    # Notifications
    path('notifications/', get_notifications, name='get_notifications'),
    path('notifications/<int:notification_id>/read/', mark_notification_read, name='mark_notification_read'),
    path('notifications/read/all/', mark_all_notifications_read, name='mark_all_notifications_read'),
    
    # Messages
    path('messages/', messages_view, name='messages'),
    path('messages/<int:user_id>/', conversation_view, name='conversation'),
    path('messages/send/<int:user_id>/', send_message, name='send_message'),
    
    # Page d'accueil / fil d'actualité
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('feed/', feed, name='fils_actualite'),
    
    # Posts
    path('posts/like/<int:post_id>/', toggle_like, name='toggle_like'),
    path('posts/comment/add/<int:post_id>/', add_comment, name='add_comment'),
    path('posts/repost/<int:post_id>/', repost, name='repost'),
    path('posts/comment/like/<int:comment_id>/', toggle_comment_like, name='toggle_comment_like'),
]

# Servir les fichiers media en mode debug
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
