from django import forms
from .models import Post


class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['content', 'image', 'video']
        widgets = {
            'content': forms.Textarea(attrs={
                'rows': 3,
                'placeholder': 'Écrivez quelque chose... (facultatif)',
                'class': 'form-control'
            }),
            'image': forms.FileInput(attrs={
                'accept': 'image/*',
                'class': 'form-control'
            }),
            'video': forms.FileInput(attrs={
                'accept': 'video/*',
                'class': 'form-control'
            }),
        }
        labels = {
            'content': 'Texte du post',
            'image': 'Ajouter une photo',
            'video': 'Ajouter une vidéo',
        }