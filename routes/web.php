<?php

use App\Http\Controllers\BooksController;
use App\Http\Controllers\MembersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::resource('books', BooksController::class);
    Route::resource('members', MembersController::class);
    
    // Borrowings route with mock data for frontend testing
    Route::get('borrowings', function () {
        return Inertia::render('borrowings', [
            'borrowings' => [
                [
                    'id' => 1,
                    'member_id' => 1,
                    'member_name' => 'John Doe',
                    'member_email' => 'john@example.com',
                    'books' => [
                        ['id' => 1, 'title' => 'Belajar React', 'author' => 'Developer A'],
                        ['id' => 2, 'title' => 'PHP untuk Pemula', 'author' => 'Developer B']
                    ],
                    'borrow_date' => '2025-07-20T10:00:00Z',
                    'due_date' => '2025-07-27T10:00:00Z',
                    'return_date' => null,
                    'status' => 'borrowed',
                    'created_at' => '2025-07-20T10:00:00Z',
                    'updated_at' => '2025-07-20T10:00:00Z',
                ],
                [
                    'id' => 2,
                    'member_id' => 2,
                    'member_name' => 'Jane Smith',
                    'member_email' => 'jane@example.com',
                    'books' => [
                        ['id' => 3, 'title' => 'Database MySQL', 'author' => 'Developer C']
                    ],
                    'borrow_date' => '2025-07-15T10:00:00Z',
                    'due_date' => '2025-07-22T10:00:00Z',
                    'return_date' => '2025-07-21T14:30:00Z',
                    'status' => 'returned',
                    'created_at' => '2025-07-15T10:00:00Z',
                    'updated_at' => '2025-07-21T14:30:00Z',
                ],
                [
                    'id' => 3,
                    'member_id' => 3,
                    'member_name' => 'Bob Johnson',
                    'member_email' => 'bob@example.com',
                    'books' => [
                        ['id' => 4, 'title' => 'Pemrograman Laravel', 'author' => 'Developer D']
                    ],
                    'borrow_date' => '2025-07-10T10:00:00Z',
                    'due_date' => '2025-07-17T10:00:00Z',
                    'return_date' => null,
                    'status' => 'overdue',
                    'created_at' => '2025-07-10T10:00:00Z',
                    'updated_at' => '2025-07-10T10:00:00Z',
                ]
            ]
        ]);
    })->name('borrowings.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
