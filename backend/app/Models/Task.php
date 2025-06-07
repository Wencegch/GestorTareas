<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Asegúrate de importar BelongsTo

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'due_date',   
        'completed', // <--- ¡CAMBIADO DE 'status' A 'completed'!
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'due_date' => 'datetime', // 'date' es correcto, 'datetime' también es común y más flexible
        'completed' => 'boolean', // <--- ¡AÑADIDO ESTO!
    ];

    /**
     * The user that owns the task.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo // Añade el tipo de retorno para mejor legibilidad
    {
        return $this->belongsTo(User::class);
    }

    // `protected $hidden` generalmente no es necesario si solo ocultas la contraseña del usuario.
    // Si no necesitas ocultar nada específico de la tarea, puedes quitarlo.
    // protected $hidden = [
    //     //
    // ];
}