<?php

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Base\BaseEndpoint;

class VcardsEndpoint extends BaseEndpoint {

    /**
     * Constructor
     */
    public function __construct()
    {
        // Call the parent constructor
        parent::__construct();

        // Initialize the Endpoint
        $this->init('vcards');

        // Set Properties
        $this->required = ['subject','content','targetTable','targetId'];
    }

    /**
     * Retrieve a record
     */
    public function fetchAction(): array
    {
        // Call the parent constructor
        $message = parent::fetchAction();

        // Check if the records is accessible
        if($message['status'] == 200){

            // Initialize the edit mode
            $edit = false;

            // Evaluate the edit mode
            if(!$edit){
                $edit = (!in_array($message['data']['record']['category'],['User','Organization']));
            }
            if(!$edit){
                $edit = ($message['data']['record']['id'] == $this->Auth->user()->vcard['id']);
            }
            if(!$edit){
                $edit = $this->Auth->isAuthorized("BusinessAccountManager", 3);
            }

            // Save the edit mode
            $message['data']['edit'] = $edit;

            // Load the preview
            $message['data']['preview'] = $this->Helper->Vcards->format($message['data']['record'], $edit);

            // Check if the Relationship Plugin is accessible
            if($this->Helper->Core->isInstalled('relationship')){
                $message['data']['dependencies']['relationship'] = $this->Model->Relationship->get($this->basename, $message['data']['record']['id']);
                if($this->Helper->Core->isInstalled('vcards') && array_key_exists('vcard', $message['data']['record'])){
                    $message['data']['dependencies']['relationship'] = array_merge(
                        $message['data']['dependencies']['relationship'],
                        $this->Model->Relationship->get('vcards', $message['data']['record']['id'])
                    );
                }
            }

            // Check if the Events is accessible
            if($this->Helper->Core->isInstalled('event')){
                $message['data']['dependencies']['event'] = $this->Model->Event->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                    ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['id']],
                    ["key" => "isArchived", "operator" => "<>", "value" => 1],
                ]);
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Create a record
     */
    public function createAction(): array
    {
        // Call the parent constructor
        $message = parent::createAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Retrieve the parameters
            $parameters = $message['data']['parameters'];

            // Initialize the fields array
            $fields = [];

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Vcard',
                    'message' => 'New Vcard Created by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/plugin/vcards/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['name']),
                    'targetTable' => 'vcards',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['targetTable'].'/details?id='.$message['data']['record']['targetId'];
                $event['targetTable'] = $message['data']['record']['targetTable'];
                $event['targetId'] = $message['data']['record']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }

            // Check if tags is set
            if($this->Helper->Core->isInstalled('tags') && array_key_exists('tags', $parameters) && is_array($parameters['tags']) && !empty($parameters['tags'])){

                // Loop through the tags
                foreach($parameters['tags'] ?? [] as $key => $tag){

                    // Check if the tag is not empty
                    if(!empty($tag)){

                        // Create the tag
                        $this->Model->Tags->create(['name' => $tag]);
                    }
                }
            }

            // Check if industries is set
            if($this->Helper->Core->isInstalled('industries') && array_key_exists('industries', $parameters) && !is_array($parameters['industries']) && !empty($parameters['industries'])){

                // Loop through the industries
                foreach($parameters['industries'] ?? [] as $key => $industry){

                    // Check if the industry is not empty
                    if(!empty($industry)){

                        // Create the industry
                        $this->Model->Industries->create(['name' => $industry]);
                    }
                }
            }

            // Check if $fields is empty
            if(!empty($fields)){
                $affectedRows = $this->Model->Vcards->update($message['data']['record']['id'], $fields);
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Update a record
     */
    public function updateAction(): array
    {
        // Call the parent constructor
        $message = parent::updateAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Retrieve the parameters
            $parameters = $message['data']['parameters'];

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Vcard',
                    'message' => 'Vcard Updated by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/plugin/vcards/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['name']),
                    'targetTable' => 'vcards',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }

            // Check if tags is set
            if($this->Helper->Core->isInstalled('tags') && array_key_exists('tags', $parameters) && is_array($parameters['tags']) && !empty($parameters['tags'])){

                // Loop through the tags
                foreach($parameters['tags'] ?? [] as $key => $tag){

                    // Check if the tag is not empty
                    if(!empty($tag)){

                        // Create the tag
                        $this->Model->Tags->create(['name' => $tag]);
                    }
                }
            }

            // Check if industries is set
            if($this->Helper->Core->isInstalled('industries') && array_key_exists('industries', $parameters) && !is_array($parameters['industries']) && !empty($parameters['industries'])){

                // Loop through the industries
                foreach($parameters['industries'] ?? [] as $key => $industry){

                    // Check if the industry is not empty
                    if(!empty($industry)){

                        // Create the industry
                        $this->Model->Industries->create(['name' => $industry]);
                    }
                }
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Delete a record
     */
    public function deleteAction(): array
    {
        // Call the parent constructor
        $message = parent::deleteAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Vcard',
                    'message' => 'Vcard Deleted by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/plugin/vcards/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['name']),
                    'targetTable' => 'vcards',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['targetTable'].'/details?id='.$message['data']['record']['targetId'];
                $event['targetTable'] = $message['data']['record']['targetTable'];
                $event['targetId'] = $message['data']['record']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Archive a record
     */
    public function archiveAction(): array
    {
        // Call the parent constructor
        $message = parent::archiveAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Vcard',
                    'message' => 'Vcard Archived by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/plugin/vcards/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['name']),
                    'targetTable' => 'vcards',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['targetTable'].'/details?id='.$message['data']['record']['targetId'];
                $event['targetTable'] = $message['data']['record']['targetTable'];
                $event['targetId'] = $message['data']['record']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Recover a record
     */
    public function recoverAction(): array
    {
        // Call the parent constructor
        $message = parent::recoverAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Vcard',
                    'message' => 'Vcard Recovered for <vcard>'.$message['data']['record']['id'].':'.$message['data']['record']['name'].'</vcard> by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/plugin/vcards/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['name']),
                    'targetTable' => 'vcards',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['targetTable'].'/details?id='.$message['data']['record']['targetId'];
                $event['targetTable'] = $message['data']['record']['targetTable'];
                $event['targetId'] = $message['data']['record']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }
        }

        // Return the message
        return $message;
    }
}
