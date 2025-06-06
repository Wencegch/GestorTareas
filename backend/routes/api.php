<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserProfileController;

// Estas rutas manejan el login/registro manual y devuelven tokens.
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [LoginController::class, 'login']);

//// Estas rutas están protegidas y esperan un token Bearer en el encabezado Authorization.
// El middleware 'auth:sanctum' se encarga de validar el token.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', function(Request $request) {
        // Al hacer logout, revoca el token actual del usuario.
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada correctamente']);
    });

    // Ruta para obtener el usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rutas de tareas protegidas
    Route::apiResource('tasks', TaskController::class);

    // Ruta para actualizar el perfil del usuario autenticado
    Route::put('/user/profile', [UserProfileController::class, 'update']);

});