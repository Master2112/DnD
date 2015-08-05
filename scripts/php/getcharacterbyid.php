<?php
include "databasefunctions.php";
$id = $_GET["id"];

$charData = GetCharacter($id);

$char = new Character($charData);

echo json_encode($char);

class Character
{
	var $curr = 0;
	
	function __construct($d) //order of variables MUST match database field order
	{
		$this->curr = 0;
		$this->id = $d[$this->next()];
		
		$this->info = new Collection();
		$this->info->name = $d[$this->next()];
		$this->info->level = $d[$this->next()];
		$this->info->race = $d[$this->next()];
		$this->info->background = $d[$this->next()];
		$this->info->alignment = $d[$this->next()];
		
		$this->ownerId = $d[$this->next()];
		
		$this->info->experience = $d[$this->next()];
		$this->inspiration = $d[$this->next()];
		$this->inventory = $d[$this->next()];
		
		$this->skills = new Collection();
		$this->skills->languages = $d[$this->next()];
		$this->skills->proficiencies = $d[$this->next()];
		$this->skills->features = $d[$this->next()];
		
		$this->personality = new Collection();
		$this->personality->traits = $d[$this->next()];
		$this->personality->ideals = $d[$this->next()];
		$this->personality->bonds = $d[$this->next()];
		$this->personality->flaws = $d[$this->next()];
		
		$this->info->age = $d[$this->next()];
		$this->info->appearance = new Collection();
		$this->info->appearance->eyes = $d[$this->next()];
		$this->info->appearance->height = $d[$this->next()];
		$this->info->appearance->skin = $d[$this->next()];
		$this->info->weight = $d[$this->next()];
		$this->info->appearance->hair = $d[$this->next()];
		$this->info->allies = $d[$this->next()];
		$this->info->organizations = $d[$this->next()];
		$this->info->appearance->imageURL = $d[$this->next()];
		$this->info->backstory = $d[$this->next()];
		
		$this->status = new Collection();
		$this->status->currentHealth = $d[$this->next()];
		$this->assignedGameId = $d[$this->next()];
		
		$this->ratings = new Collection();
		$this->ratings->asPlayer = new Collection();
		$this->ratings->asPlayer->positive = $d[$this->next()];
		$this->ratings->asPlayer->negative = $d[$this->next()];
		$this->ratings->asMaster = new Collection();
		$this->ratings->asMaster->positive = $d[$this->next()];
		$this->ratings->asMaster->negative = $d[$this->next()];
		$this->isPermanentlyDead = $d[$this->next()] == 1;
		
		$this->status->location = $d[$this->next()];
		$this->stats = new Collection();
		$this->stats->speed = $d[$this->next()];
		$this->stats->strength = $d[$this->next()];
		$this->stats->dexterity = $d[$this->next()];
		$this->stats->constitution = $d[$this->next()];
		$this->stats->intelligence = $d[$this->next()];
		$this->stats->wisdom = $d[$this->next()];
		$this->stats->charisma = $d[$this->next()];
		
		$this->stats->bonusses = new Collection();
		$this->stats->bonusses->savingThrows = new Collection();
		$this->stats->bonusses->savingThrows->strength = $d[$this->next()] == 1;
		$this->stats->bonusses->savingThrows->dexterity = $d[$this->next()] == 1;
		$this->stats->bonusses->savingThrows->constitution = $d[$this->next()] == 1;
		$this->stats->bonusses->savingThrows->intelligence = $d[$this->next()] == 1;
		$this->stats->bonusses->savingThrows->wisdom = $d[$this->next()] == 1;
		$this->stats->bonusses->savingThrows->charisma = $d[$this->next()] == 1;
		
		$this->stats->bonusses->skills = new Collection();
		$this->stats->bonusses->skills->acrobatics = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->animalHandling = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->arcana = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->athletics = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->deception = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->history = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->insight = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->intimidation = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->investigation = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->medicine = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->nature = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->perception = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->performance = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->persuasion = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->religion = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->sleighOfHand = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->stealth = $d[$this->next()] == 1;
		$this->stats->bonusses->skills->survival = $d[$this->next()] == 1;
		
		$this->stats->bonusses->passiveWisdom = $d[$this->next()];
		$this->stats->initiative = $d[$this->next()];
		$this->hitDice = $d[$this->next()];
		
		$this->spellcasting = new Collection();
		$this->spellcasting->casterClass = $d[$this->next()];
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

class Collection{}