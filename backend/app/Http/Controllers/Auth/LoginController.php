<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Buscar usuario por email
        $user = User::where('email', $credentials['email'])->first();

        // Verificar credenciales
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        // Opcional pero recomendable: Revocar tokens existentes para el usuario
        // Esto asegura que cada sesión de login tenga un token único y el anterior sea inválido.
        $user->tokens()->delete();

        // Crear token para la API
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login correcto',
            'token' => $token, // El token se devuelve al frontend
            'user' => $user, // Puedes devolver los datos del usuario si los necesitas en el frontend
        ]);
    }
}