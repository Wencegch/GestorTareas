<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Añade esta nueva ruta de prueba
Route::get('/prueba', function () {
    return '<h1>¡Hola desde Laravel!</h1>';
});