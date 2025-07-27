<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class members extends Model
{
    protected $table = 'members';

    protected $fillable = [
        'name',
        'email',
        'membercode',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($member) {
            $lastMember = self::latest('id')->first();
            $number = $lastMember ? $lastMember->id + 1 : 1;
            $member->membercode = 'MBR' . str_pad($number, 3, '0', STR_PAD_LEFT);
        });
    }
 
}
