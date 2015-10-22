<?php

class Character
{
	var $curr = 0;
	
	function __construct($d) //order of variables MUST match database field order
	{
		$this->curr = 0;
		$this->id = (int)$d[$this->next()];
		
		$this->info = new Collection();
		$this->info->name = $d[$this->next()];
		
		$this->ownerId = (int)$d[$this->next()];
		
		$this->info->experience = (int)$d[$this->next()];
		
		$this->info->level = 1; //TODO: Calc from experience
		
		$this->inventory = $d[$this->next()];
		
		$this->info->age = $d[$this->next()];
		
		$this->status = new Collection();
		$this->status->currentHealth = (int)$d[$this->next()];
		$this->status->maxHitPoints = (int)$d[$this->next()];
		$this->spells = $d[$this->next()];
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