<?php

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Objects;
use \LaswitchTech\Core\Abstracts\Controller;

class VcardsController extends Controller {

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
            case "/vcards/avatar":
                $this->Public = true;
                $this->Level = 0;
                break;
        }
    }

    /**
     * Fetch a vCard's Avatar
     */
    public function avatarAction(): array
    {

        // Retrieve the parameters
        $id = $this->Request->getParams('GET', 'id') ?? null;
        $email = $this->Request->getParams('GET', 'email') ?? 'Unknown';
        $website = $this->Request->getParams('GET', 'website') ?? null;
        $username = $this->Request->getParams('GET', 'username') ?? null;
        $size = $this->Request->getParams('GET', 'size') ?? 128;

        // Retrieve the vcard
        $vcard = null;
        if($id){
            $vcard = $this->Model->Vcards->fetch($id);
        } elseif($username){
            $vcard = $this->Model->Vcards->fetchByEmail($username);
        } elseif($email){
            $vcard = $this->Model->Vcards->fetchByEmail($email);
        } elseif($website){
            $vcard = $this->Model->Vcards->fetchByWebsite($website);
        }

        // Check if vcard was retrieved
        if($vcard){

            // Set the email
            $email = $vcard['email'] ?? 'Unknown';
            $domain = explode('@', $email)[1] ?? 'Unknown';

            // Check if the user has an avatar
            if($vcard['avatar']['uuid']){

                // Retrieve the file content
                $vcard['avatar']['content'] = $this->Helper->Files->get($vcard['avatar']['path'] . DIRECTORY_SEPARATOR . $vcard['avatar']['uuid']);

                // Return the file
                return $vcard['avatar'];
            }

            // Check if the vcard has a website
            if($vcard['website']){
                $content = $this->Helper->Favicon->content($vcard['website']);
                $logo = [
                    'type' => $this->Helper->Favicon->mimeType($content),
                    'content' => $content
                ];
                // Convert the logo to png format
                $logo = $this->Helper->Favicon->convert($logo, 'png', $size, $size);
                return $logo;
            }

            // Check if the vcard is a user or contact
            if(!in_array(strtolower($vcard['category']), ['user', 'contact'])){

                // Create the default logo from the img folder
                $assetPath = $this->Config->root() . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'img' . DIRECTORY_SEPARATOR . 'avatar.png';
                if(!is_file($assetPath)){
                    $assetPath = $this->Config->root() . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'laswitchtech' . DIRECTORY_SEPARATOR . 'core' . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'img' . DIRECTORY_SEPARATOR . 'avatar.png';
                }
                if(is_file($assetPath)){
                    return [
                        'type' => mime_content_type($assetPath),
                        'content' => file_get_contents($assetPath)
                    ];
                }
            }
        }

        // Return the default logo
        return [
            'type' => $this->Helper->Gravatar->mimeType($email, $size),
            'content' => $this->Helper->Gravatar->content($email, $size)
        ];
    }
}
