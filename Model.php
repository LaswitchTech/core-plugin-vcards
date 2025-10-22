<?php

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Base\BaseModel;

class VcardsModel extends BaseModel {

    /**
     * Constructor
     */
    public function __construct()
    {
        // Call the parent constructor
        parent::__construct();

        // Initialize the Model
        $this->init('vcards');
    }

    /**
     * Process a record
     *
     * @param array $record
     * @return array
     */
    protected function process(array $record): array
    {
        // Call the parent constructor
        $record = parent::process($record);

        // Process the JSON fields
        if(!is_array($record['role'])){
            $record['role'] = json_decode($record['role'] ?? "[]", true);
        }
        if(!is_array($record['tags'])){
            $record['tags'] = json_decode($record['tags'] ?? "[]", true);
        }
        if(!is_array($record['industries'])){
            $record['industries'] = json_decode($record['industries'] ?? "[]", true);
        }

        // Return the processed record
        return $record;
    }

    /**
     * Apply Joins to the Query
     *
     * @param Query $Query
     * @return Query
     */
    protected function joins(object $Query): object
    {
        // Apply Joins
        $Query->join('avatar', 'files', 'id')
            ->join('country', 'countries', 'code')
            ->join('state', 'states', 'code');

        return $Query;
    }

    /**
     * Retrieve a single record by email
     *
     * @param string $email
     * @return array
     */
    public function fetchByEmail(string $email): array
    {
        // Create the Query
        $Query = $this->Database->query()
            ->table($this->table)
            ->select('*')
            ->join('owner', 'users', 'username')
            ->join('owner.vcard', 'vcards', 'id')
            ->filter()
            ->where('id', 9999, '<>')
            ->filter()
            ->where('email', $email)
            ->limit(1);

        // Verify the Organization
        if(array_key_exists('organization',$this->definition)){
            if($this->Auth->isAuthenticated()){
                $Query->join('organization', 'organizations', 'id')
                    ->join('organization.vcard', 'vcards', 'id')
                    ->where('organization', $this->Auth->user()->organization()->id);
            }
        }

        // Apply Joins
        $Query = $this->joins($Query);

        // Retrieve the record
        $records = $Query->fetch();

        // Loop through the records to process them
        foreach($records as $key => $record){

            // Overwrite the record with the processed one
            $records[$key] = $this->process($record);
        }

        // Return the record or an empty array if not found
        return $records[array_key_first($records)] ?? [];
    }

    /**
     * Retrieve a single record by website
     *
     * @param string $website
     * @return array
     */
    public function fetchByWebsite(string $website): array
    {
        // Create the Query
        $Query = $this->Database->query()
            ->table($this->table)
            ->select('*')
            ->join('owner', 'users', 'username')
            ->join('owner.vcard', 'vcards', 'id')
            ->filter()
            ->where('id', 9999, '<>')
            ->filter()
            ->where('website', $website)
            ->limit(1);

        // Verify the Organization
        if(array_key_exists('organization',$this->definition)){
            if($this->Auth->isAuthenticated()){
                $Query->join('organization', 'organizations', 'id')
                    ->join('organization.vcard', 'vcards', 'id')
                    ->where('organization', $this->Auth->user()->organization()->id);
            }
        }

        // Apply Joins
        $Query = $this->joins($Query);

        // Retrieve the record
        $records = $Query->fetch();

        // Loop through the records to process them
        foreach($records as $key => $record){

            // Overwrite the record with the processed one
            $records[$key] = $this->process($record);
        }

        // Return the record or an empty array if not found
        return $records[array_key_first($records)] ?? [];
    }
}
