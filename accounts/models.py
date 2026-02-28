from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Count
from django.utils import timezone


class CustomUser(AbstractUser):
    photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True, help_text="Photo de profil")
    
    def __str__(self):
        return self.username

    @property
    def total_posts(self):
        """Retourne le nombre total de posts de l'utilisateur"""
        return self.post_set.count()

    @property
    def total_likes_received(self):
        """Retourne le nombre total de likes reçus sur tous ses posts et commentaires"""
        # Compte les likes de tous les posts de l'utilisateur
        total = 0
        for post in self.post_set.all():
            total += post.likes.count()
        # Compte les likes de tous ses commentaires
        from interactions.models import Comment
        for comment in Comment.objects.filter(author=self):
            total += comment.likes.count()
        return total

    @property
    def friends(self):
        """Retourne la liste des amis de l'utilisateur"""
        # Utilisateurs qui ont accepté notre demande d'amitié
        friends_from_me = FriendRequest.objects.filter(from_user=self, status='accepted').values_list('to_user', flat=True)
        # Utilisateurs qui nous ont envoyé une demande acceptée
        friends_to_me = FriendRequest.objects.filter(to_user=self, status='accepted').values_list('from_user', flat=True)
        
        # Combiner les deux listes
        all_friends = list(friends_from_me) + list(friends_to_me)
        return CustomUser.objects.filter(id__in=all_friends)

    @property
    def unread_notifications_count(self):
        """Retourne le nombre de notifications non lues"""
        return Notification.objects.filter(recipient=self, is_read=False).count()

    @property
    def unread_messages_count(self):
        """Retourne le nombre de messages non lus"""
        return Message.objects.filter(recipient=self, is_read=False).count()

    @property
    def pending_friend_requests_count(self):
        """Retourne le nombre de demandes d'ami en attente"""
        return FriendRequest.objects.filter(to_user=self, status='pending').count()


class FriendRequest(models.Model):
    """Modèle pour les demandes d'ami"""
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('accepted', 'Acceptée'),
        ('rejected', 'Refusée'),
    ]
    
    from_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='friend_requests_sent')
    to_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='friend_requests_received')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('from_user', 'to_user')
        ordering = ['-created_at']

    def __str__(self):
        return f"Demande d'ami de {self.from_user.username} à {self.to_user.username}"


class Notification(models.Model):
    """Modèle pour les notifications"""
    TYPE_CHOICES = [
        ('friend_request', 'Demande d\'ami'),
        ('friend_accepted', 'Ami accepté'),
        ('new_post', 'Nouveau post d\'un ami'),
        ('like', 'Nouveau like'),
        ('comment', 'Nouveau commentaire'),
    ]
    
    recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True)  # Lien vers l'action
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification pour {self.recipient.username}: {self.notification_type}"


class Message(models.Model):
    """Modèle pour les messages privés"""
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='messages_sent')
    recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='messages_received')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Message de {self.sender.username} à {self.recipient.username}"
