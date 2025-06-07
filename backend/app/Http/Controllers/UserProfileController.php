<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user(); // Obtiene el usuario autenticado

        // 1. Validar la petición
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password_current' => ['nullable', 'string', 'min:8'], // Opcional: si requieres contraseña actual
            'password' => ['nullable', 'string', 'min:8', 'confirmed'], // 'confirmed' busca 'password_confirmation'
        ]);

        // 2. Actualizar el nombre y email
        $user->name = $request->input('name');
        $user->email = $request->input('email');

        // 3. Actualizar la contraseña si se proporciona
        if ($request->filled('password')) {            
            if (!$request->filled('password_current') || !Hash::check($request->input('password_current'), $user->password)) {
                throw ValidationException::withMessages([
                    'password_current' => ['La contraseña actual no es correcta.'],
                ]);
            }
            // Si la contraseña actual es correcta, actualiza la nueva contraseña
            $user->password = Hash::make($request->input('password'));
        }

        $user->save();

        return response()->json(['message' => 'Perfil actualizado correctamente.', 'user' => $user]);
    }
}