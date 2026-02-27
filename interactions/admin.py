from django.contrib import admin
from .models import Like
from interactions.models import Like   




@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__author__username')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)
    
    