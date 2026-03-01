from django.db import models
from django.conf import settings


class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)

    def __str__(self):
        return f"Post de {self.author.username} - {self.created_at.strftime('%d/%m/%Y')}"

    @property
    def total_likes(self):
        """Retourne le nombre de likes sur ce post"""
        return self.likes.count()

    class Meta:
        ordering = ['-created_at']
