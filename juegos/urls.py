from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    # Las rutas para cada juego se añadirán aquí
    path('abc-magico/', views.abc_magico, name='abc_magico'),
    path('juego-master/', views.juego_master, name='juego_master'),
    path('numero-master/', views.numero_master, name='numero_master'),
    path('respirador/', views.respirador, name='respirador'),
    path('rompecabezas/', views.rompecabezas, name='rompecabezas'),
    path('rutinas/', views.rutinas, name='rutinas'),
    path('terapeutico/', views.terapeutico, name='terapeutico'),
    path('simon/', views.simon, name='simon'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('signup/', views.signup, name='signup'),
]
