<?php

namespace Database\Seeders;
use App\Models\books;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BooksSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         books::factory()->create([
            'title' => 'Test Book',
            'author' => 'Test Author',
            'category' => 'Fiction',
            'stock' => 10,
        ]);
    }
}
