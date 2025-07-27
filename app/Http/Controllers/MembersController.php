<?php

namespace App\Http\Controllers;

use App\Models\members;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MembersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $members = members::all();
        return Inertia::render('members', [
            'members' => $members
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('members/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:members',
        ]);

        members::create($validated);

        return redirect()->route('members.index')->with('success', 'Member created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(members $members)
    {
        return Inertia::render('members/show', [
            'member' => $members
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(members $members)
    {
        return Inertia::render('members/edit', [
            'member' => $members
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, members $members)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:members,email,' . $members->id,
        ]);

        $members->update($validated);

        return redirect()->route('members.index')->with('success', 'Member updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(members $members)
    {
        $members->delete();

        return redirect()->route('members.index')->with('success', 'Member deleted successfully.');
    }
}
