<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Task; // Importa el modelo Task
use App\Models\User; // Importa el modelo User para obtener IDs de usuarios

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Asegúrate de que hay usuarios en la base de datos para asignarles tareas
        if (User::count() === 0) {
            $this->call(UserSeeder::class); // Llama al UserSeeder si no hay usuarios
        }

        $userIds = User::pluck('id')->all(); // Obtener todos los IDs de usuario

        // Crear 50 tareas de ejemplo
        for ($i = 0; $i < 50; $i++) {
            Task::create([
                'title' => fake()->sentence(3), // Título de la tarea
                'description' => fake()->paragraph(2), // Descripción
                'due_date' => fake()->dateTimeBetween('+1 day', '+1 year')->format('Y-m-d'), // Fecha de vencimiento
                'completed' => fake()->boolean(),
                'priority' => fake()->randomElement(['low', 'medium', 'high']), // Prioridad aleatoria
                'user_id' => fake()->randomElement($userIds), // Asignar a un usuario aleatorio
            ]);
        }
    }
}