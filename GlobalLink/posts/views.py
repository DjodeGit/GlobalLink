from django.shortcuts import render

# Create your views here.
from django.contrib.auth.decorators import login_required

def home(request):
    if request.user.is_authenticated:
        # Redirige vers le fil d'actualité si déjà connecté
        return redirect('feed')  # ou le nom de ta vue fil d'actualité
    
    # Sinon → page publique de bienvenue
    return render(request, 'home.html', {
        'page_title': 'Mini Social Network',
    })