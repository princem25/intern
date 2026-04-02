<?php

namespace App\Http\Controllers;

use App\Models\Technology;

class TechnologyController extends Controller
{
    /**
     * Get all technologies
     */
    public function index()
    {
        return response()->json(Technology::all());
    }
}
