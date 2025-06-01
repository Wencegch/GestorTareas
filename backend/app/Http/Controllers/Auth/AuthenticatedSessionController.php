<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    public function store(Request $request): Response
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        // Aquí es donde generas el token de Sanctum para el usuario autenticado
        // Y lo devuelves al frontend
        $token = $request->user()->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $request->user(),
        ]);
    }

    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Revocar el token de Sanctum al desloguear
        $request->user()->tokens()->where('name', 'auth_token')->delete();

        return response()->noContent();
    }
}