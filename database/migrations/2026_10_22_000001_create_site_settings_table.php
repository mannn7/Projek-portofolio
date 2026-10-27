<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('ambient_audio')->nullable();
            $table->unsignedTinyInteger('audio_volume')->default(50);
            $table->boolean('audio_enabled')->default(true);
            $table->boolean('audio_loop')->default(true);
            $table->timestamps();
        });

        DB::table('site_settings')->insert([
            'ambient_audio' => '/audio/portfolio-ambient.mp3',
            'audio_volume' => 50,
            'audio_enabled' => true,
            'audio_loop' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
