<?php

namespace App\Http\Controllers;

use App\Models\books;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BooksController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $books = books::all();
        return Inertia::render('books', [
            'books' => $books
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('books/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'category' => 'required|string|max:20',
            'stock' => 'required|integer',
        ]);

        books::create($validated);

        return redirect()->route('books.index')->with('success', 'Book created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(books $books)
    {
        return Inertia::render('books/show', [
            'book' => $books
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(books $books)
    {
        return Inertia::render('books/edit', [
            'book' => $books
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, books $books)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'category' => 'required|string|max:20',
            'stock' => 'required|integer',
        ]);

        $books->update($validated);

        return redirect()->route('books.index')->with('success', 'Book updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(books $books)
    {
        $books->delete();

        return redirect()->route('books.index')->with('success', 'Book deleted successfully.');
    }
}
