<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Título de la tarea
            $table->text('description')->nullable(); // Descripción, puede ser nula
            $table->date('due_date')->nullable(); // Fecha de vencimiento
            $table->enum('status', ['pending', 'completed'])->default('pending'); // Estado de la tarea, por defecto 'pending'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
