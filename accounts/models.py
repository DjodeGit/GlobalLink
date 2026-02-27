from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    # Pas de champs supplémentaires pour l'instant (on reste minimal)
    # On pourra ajouter bio, photo, etc. plus tard si besoin

    def __str__(self):
        return self.username
