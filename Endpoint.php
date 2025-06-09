<?php

/**
 * Core Framework - VcardsEndpoint
 *
 * @license    MIT (https://mit-license.org/)
 * @author     Louis Ouellet <louis@laswitchtech.com>
 */

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Abstracts\Endpoint;

class VcardsEndpoint extends Endpoint {

    /**
     * Constructor
     */
    public function __construct()
    {

        // Call Parent Constructor
        parent::__construct();

        // Retrieve the namespace
        $namespace = $this->Request->getNamespace();

        // Set Global access
        $this->Public = false;

        // Set Properties
        switch($namespace){
            case "/vcards/index":
            case "/vcards/details":
            case "/vcards/preview":
            case "/vcards/describe":
                $this->Level = 1;
                break;
            case "/vcards/update":
            case "/vcards/avatar":
                $this->Level = 3;
                break;
        }
    }

    /**
     * Retrieve vCards
     */
    public function indexAction(): array
    {
        $records = $this->Model->Vcards->list($this->Auth->user()->organization()->id);
        $message = [
            "status" => 200,
            "message" => "OK",
            "data" => [
                "records" => $records,
            ]
        ];
        return $message;
    }

    /**
     * Retrieve vCard's Details
     */
    public function detailsAction(): array
    {
        // Set default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Retrieve the vCard
        $vcard = $this->Model->Vcards->get(intval($this->Request->getParams('GET','id')));

        // Initialize the edit mode
        $edit = false;

        // Check if the vCard exists
        if(empty($vcard)){
            $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested vCard."];
        } else {

            // Check if the vCard is accessible
            if($vcard['organization']['id'] != $this->Auth->user()->organization()->id){
                $message = ["status" => 403, "message" => "Forbidden", "data" => "You are not allowed to access this vCard."];
            }
        }

        // If all good, return the vCard
        if($message['status'] == 200){
            if(!$edit){
                $edit = (!in_array($vcard['category'],['User','Organization']));
            }
            if(!$edit){
                $edit = ($vcard['id'] == $this->Auth->user()->vcard['id']);
            }
            if(!$edit){
                $edit = $this->Auth->isAuthorized("BusinessAccountManager", 3);
            }
            $message['data'] = [
                "record" => $vcard,
                "edit" => $edit,
                "preview" => $this->Helper->Vcards->format($vcard, $edit),
                "relationships" => $this->Model->Relationship->get('vcards', $vcard['id']),
            ];
        }
        return $message;
    }

    /**
     * Update a vCard
     */
    public function updateAction(): array
    {
        // Import Global Variables
        global $CSRF;

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Check the request method
        if($this->Request->getMethod() == "POST"){
            $message["data"]["CSRF"] = [
                "token" => $CSRF->token(),
                "key" => $CSRF->key()
            ];
        }

        // Retrieve the vCard id
        $id = intval($this->Request->getParams('REQUEST','id'));

        // Retrieve the vCard
        $vCard = $this->Model->Vcards->get($id);

        // Check if the vCard exists
        if(empty($vCard)){
            $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested vCard."];
        }

        // Check if the vCard is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "POST"){

                // Retrieve the parameters
                $parameters = $this->Request->getParams('REQUEST');

                // Set Required Fields
                $required = ['name','address','city','country','state','zipcode','email','phone','locale','website'];

                // Set Optional Fields
                $optional = ['tollfree','mobile','fax','role','dba','title','tags','industries','businessNumber','taxExtension','importerExtension'];

                // Set Unique Fields
                $unique = ['id','created','modified','owner','category','organization','avatar'];

                // Sanitize the parameters
                foreach($parameters as $key => $value){
                    if(in_array($key,['tags','industries']) && !is_array($value)){
                        $value = json_decode($value, true);
                        $parameters[$key] = $value;
                    }
                    if(!in_array($key,['country','state','locale','website','zipcode','email'])){
                        if(!is_array($value)){
                            if(in_array($key,['name','dba']) && in_array($vCard['category'],['Organization','Lead','Client'])){
                                $parameters[$key] = $value;
                            } else {
                                $parameters[$key] = ucwords(strtolower($value));
                            }
                        } else {
                            foreach($value as $k => $v){
                                $parameters[$key][$k] = ucwords(strtolower($v));
                            }
                        }
                    }
                }

                // Check if all required fields are set
                if(count(array_intersect_key(array_flip($required), $parameters)) == count($required)){

                    // Initialize the Events
                    $message['data']['events'] = [];

                    // Update the vCard
                    foreach($required as $key){
                        if(isset($parameters[$key])){
                            $vCard[$key] = $parameters[$key];
                        }
                    }
                    foreach($optional as $key){
                        if(isset($parameters[$key])){
                            $vCard[$key] = $parameters[$key];
                        }
                    }
                    foreach($unique as $key){
                        if(isset($vCard[$key])){
                            unset($vCard[$key]);
                        }
                    }

                    // Update the vCard
                    $affectedRows = $this->Model->Vcards->update($id, $vCard);

                    // Check if tags is set
                    if(isset($parameters['tags'])){
                        foreach($parameters['tags'] as $key => $tag){
                            $this->Model->Tags->create($tag);
                        }
                    }

                    // Check if industries is set
                    if(isset($parameters['industries'])){
                        foreach($parameters['industries'] as $key => $industry){
                            $this->Model->Industries->create($industry);
                        }
                    }

                    // Retrieve the final lead
                    $message['data']['record'] = $this->Model->Vcards->get($id);
                } else {
                    $message['status'] = 400;
                    $message['message'] = "Bad Request";
                    $message['data']['error'] = "Some required fields are missing.";
                }
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }

        return $message;
    }

    /**
     * Update a vCard's Avatar
     */
    public function avatarAction(): array
    {
        // Import Global Variables
        global $CSRF;

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Check the request method
        if($this->Request->getMethod() == "POST"){
            $message["data"]["CSRF"] = [
                "token" => $CSRF->token(),
                "key" => $CSRF->key()
            ];
        }

        // Retrieve the vCard id
        $id = intval($this->Request->getParams('REQUEST','id'));

        // Retrieve the vCards
        $vCard = $this->Model->Vcards->get($id);
        $owner = $this->Auth->user()->username;
        $vCardUser = $this->Auth->user()->vcard();

        // Check if the vCard exists
        if(empty($vCard)){
            $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested vCard."];
        }

        // Check if the vCard is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "POST"){

                // Retrieve the parameters
                $parameters = $this->Request->getParams('REQUEST');

                // Set Required Fields
                $required = ['avatar'];

                // Set Optional Fields
                $optional = [];

                // Set Unique Fields
                $unique = ['id','created','modified','owner','category','organization'];

                // Check if all required fields are set
                if(count(array_intersect_key(array_flip($required), $parameters)) == count($required)){

                    // Initialize the Events
                    $message['data']['events'] = [];

                    // Update the vCard
                    foreach($required as $key){
                        if(isset($parameters[$key])){
                            $vCard[$key] = $parameters[$key];
                        }
                    }
                    foreach($optional as $key){
                        if(isset($parameters[$key])){
                            $vCard[$key] = $parameters[$key];
                        }
                    }
                    foreach($unique as $key){
                        if(isset($vCard[$key])){
                            unset($vCard[$key]);
                        }
                    }

                    // Update the vCard
                    $affectedRows = $this->Model->Vcards->update($id, ['avatar' => $vCard['avatar']]);

                    // Create the an event
                    $message['data']['events'][] = $this->Model->Event->create($owner, 'vcards', $id, 'Avatar', '<vcard>'.$vCardUser['id'].':'.$this->Auth->user()->username.'</vcard> has updated the avatar.');

                    // Retrieve the final lead
                    $message['data']['record'] = $this->Model->Vcards->get($id);
                } else {
                    $message['status'] = 400;
                    $message['message'] = "Bad Request";
                    $message['data']['error'] = "Some required fields are missing.";
                }
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }

        return $message;
    }

    /**
     * Retrieve the vCards table definitions
     */
    public function describeAction():array
    {
        $message = [
            "status" => 200,
            "message" => "OK",
            "data" => $this->Model->Vcards->describe()
        ];
        return $message;
    }
}
