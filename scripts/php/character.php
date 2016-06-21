<?php

class Character
{
	var $curr = 0;
	
	function __construct($d) //order of variables MUST match database field order
	{
		$this->curr = 0;
		$this->id = (int)$d[0];
		
		$this->name = $d[1];
		
		$this->ownerId = (int)$d[2];
		
		$this->inventory = $d[3];
		$this->spells = $d[4];
	}
	
	function next()
	{
		$this->curr++;
		return $this->curr - 1;
	}
	
	/*var $id = "";
	var $info;
	var $ownerId = "";*/
}