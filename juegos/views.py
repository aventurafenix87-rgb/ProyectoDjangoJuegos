from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login

# Create your views here.
@login_required
def index(request):
    games = [
        {'name': 'ABC Mágico', 'url_name': 'abc_magico', 'desc': 'Aprende las letras de forma divertida.', 'icon': '🔤', 'color': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', 'anim': 'anim-vibrate'},
        {'name': 'Juego Master', 'url_name': 'juego_master', 'desc': 'Desafía tu mente y memoria.', 'icon': '🧠', 'color': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'anim': 'anim-glow'},
        {'name': 'Número Master', 'url_name': 'numero_master', 'desc': 'Diviértete y aprende los números.', 'icon': '🔢', 'color': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 'anim': 'anim-bounce'},
        {'name': 'Respirador', 'url_name': 'respirador', 'desc': 'Ejercicios de relajación guiados.', 'icon': '🌬️', 'color': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 'anim': 'anim-breathe'},
        {'name': 'Rompecabezas', 'url_name': 'rompecabezas', 'desc': 'Arma las piezas y descubre la imagen.', 'icon': '🧩', 'color': 'linear-gradient(135deg, #fda085 0%, #f6d365 100%)', 'anim': 'anim-shake'},
        {'name': 'Rutinas', 'url_name': 'rutinas', 'desc': 'Crea hábitos saludables paso a paso.', 'icon': '📅', 'color': 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', 'anim': 'anim-float'},
        {'name': 'Terapéutico', 'url_name': 'terapeutico', 'desc': 'Juegos para mejorar la concentración.', 'icon': '🌿', 'color': 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', 'anim': 'anim-sway'},
        {'name': 'Simón', 'url_name': 'simon', 'desc': 'Sigue el patrón de colores.', 'icon': '🔴', 'color': 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', 'anim': 'anim-flash'},
    ]
    return render(request, 'juegos/index.html', {'games': games})

@login_required
def abc_magico(request):
    return render(request, 'juegos/abc_magico/index.html')

@login_required
def juego_master(request):
    return render(request, 'juegos/juego_master/index.html')

@login_required
def numero_master(request):
    return render(request, 'juegos/numero_master/index.html')

@login_required
def respirador(request):
    return render(request, 'juegos/respirador/index.html')

@login_required
def rompecabezas(request):
    return render(request, 'juegos/rompecabezas/index.html')

@login_required
def rutinas(request):
    return render(request, 'juegos/rutinas/index.html')

@login_required
def terapeutico(request):
    return render(request, 'juegos/terapeutico/index.html')

@login_required
def simon(request):
    return render(request, 'juegos/simon/index.html')

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('index')
    else:
        form = UserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})
