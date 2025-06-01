<?php

// routes/api.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\TaskController; // Asegúrate de que tu TaskController esté aquí

Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);

// Rutas protegidas por autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rutas de tareas protegidas
    Route::apiResource('tasks', TaskController::class); // Esto ya debería existir
});