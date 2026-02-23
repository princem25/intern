<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Technology;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Roles
        $roles = ['intern', 'teamlead', 'admin', 'hr'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
        
        // Seed Technologies
        $technologies = ['React', 'Laravel', 'Python', 'Java', 'Testing', 'Vue', 'Node'];
        foreach ($technologies as $tech) {
            Technology::firstOrCreate(['name' => $tech]);
        }

        // Create Admin User
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            User::firstOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Admin User',
                    'password' => Hash::make('password'),
                    'role_id' => $adminRole->id,
                    'status' => 'approved',
                ]
            );
        }

        // Create Team Lead User
        $leadRole = Role::where('name', 'teamlead')->first();
        if ($leadRole) {
            User::firstOrCreate(
                ['email' => 'lead@example.com'],
                [
                    'name' => 'Team Lead',
                    'password' => Hash::make('password'),
                    'role_id' => $leadRole->id,
                    'status' => 'approved',
                ]
            );
        }

        // Create HR User
        $hrRole = Role::where('name', 'hr')->first();
        if ($hrRole) {
            User::firstOrCreate(
                ['email' => 'hr@example.com'],
                [
                    'name' => 'HR Manager',
                    'password' => Hash::make('password'),
                    'role_id' => $hrRole->id,
                    'status' => 'approved',
                ]
            );
        }
    }
}
