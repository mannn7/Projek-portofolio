<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->string('whatsapp_url')->nullable()->after('linkedin_url');
            $table->string('instagram_url')->nullable()->after('whatsapp_url');
            $table->string('tiktok_url')->nullable()->after('instagram_url');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn([
                'whatsapp_url',
                'instagram_url',
                'tiktok_url',
            ]);
        });
    }
};
