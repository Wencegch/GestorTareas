<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController; // Asegúrate de que este también devuelva un token
use App\Http\Controllers\Auth\LoginController; // Tu nuevo controlador de login
use App\Http\Controllers\TaskController;

// Estas rutas manejan el login/registro manual y devuelven tokens.
// NO necesitan el middleware EnsureFrontendRequestsAreStateful.
Route::post('/register', [RegisteredUserController::class, 'store']); // Deberá crear y devolver un token
Route::post('/login', [LoginController::class, 'login']); // Usará tu nuevo LoginController

// Estas rutas están protegidas y esperan un token Bearer en el encabezado Authorization.
// El middleware 'auth:sanctum' se encarga de validar el token.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', function(Request $request) {
        // Al hacer logout, revoca el token actual del usuario.
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada correctamente']);
    });
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rutas de tareas protegidas
    Route::apiResource('tasks', TaskController::class);
});