<?php

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Abstracts\Helper;

class VcardsHelper extends Helper {

    /**
     * Format vCard into html
     *
     * @param array $vcard
     * @param bool $edit
     * @return string
     */
    public function format(array $vcard, bool $edit = false): string
    {
        // Import Global Variables
        global $LOCALE;

        $avatarScope = ['User','Contact','Lead','Organization','Client'];

        // Set the vCard
        $html = '<div class="vcard row g-3">';
        if(in_array($vcard['category'],$avatarScope)){
            $html .= '<div class="vcard-body col-4">';
            $html .= '<div class="d-flex flex-column justify-content-center align-items-center h-100">';
            $html .= '<div data-type="avatar" data-vcard="'.$vcard['id'].'" class="d-flex justify-content-center align-items-center position-relative rounded-circle border border-3 border-light" style="height: 186px; width: 186px;">';
            if($vcard['avatar']['uuid']){
                $html .= '<img data-type="avatar" data-vcard="'.$vcard['id'].'" class="rounded-circle" src="/files/get?uuid='.$vcard['avatar']['uuid'].'" style="max-height: 186px; max-width: 186px; height: 186px; width: 186px; object-fit: contain; object-position: center;">';
            } else {
                if(in_array($vcard['category'],['Lead','Organization','Client'])){
                    $html .= '<img data-type="avatar" data-vcard="'.$vcard['id'].'" class="rounded-circle border border-3 border-light" src="https://icons.duckduckgo.com/ip3/'.str_replace('/','',str_replace('https://','',str_replace('http://','',$vcard['website'] ?? ''))).'.ico" style="max-height: 186px; max-width: 186px; height: 186px; width: 186px; object-fit: contain; object-position: center;">';
                } else {
                    $grav_url = "https://www.gravatar.com/avatar/" . hash( "sha256", strtolower( trim( $vcard['email'] ) ) ) . "?s=192&d=mp";
                    $html .= '<img data-type="avatar" data-vcard="'.$vcard['id'].'" class="rounded-circle border border-3 border-light" src="'.$grav_url.'" style="max-height: 186px; max-width: 186px; height: 186px; width: 186px; object-fit: contain; object-position: center;">';
                }
            }
            if($edit){
                $html .= '<button data-type="avatar" data-vcard="'.$vcard['id'].'" type="button" class="ms-1 btn btn-sm btn-info fs-5 rounded-circle position-absolute" style="transition: all 0.5s ease-in-out; height: 48px!important; width: 48px!important; bottom: 4px; right: 4px;"><i class="bi bi-upload"></i></button>';
            }
            $html .= '</div>';
            $html .= '<div class="text-center">';
            $html .= '<h4 class="vcard-title fw-lighter mt-2">'.$vcard['name'].'</h4>';
            if($vcard['dba']){
                $html .= '<h5 class="vcard-subtitle text-muted">'.$vcard['dba'].'</h5>';
            }
            $html .= '</div>';
            $html .= '</div>';
            $html .= '</div>';
            $html .= '<div class="col-8">';
        }
        $html .= '<div class="vcard-body row g-3">';
        foreach($vcard as $key => $value){
            if(!empty($value)){
                switch($key){
                    case 'id':
                    case 'created':
                    case 'modified':
                    case 'owner':
                    case 'category':
                    case 'organization':
                    case 'avatar':
                        break;
                    case 'email':
                        $html .= '<div class="col-6"><div>'.$LOCALE->get(ucfirst($key)).'</div><div><a class="link-info" href="mailto:'.$value.'"><i class="me-1 bi bi-envelope"></i>'.$value.'</a></div></div>';
                        break;
                    case 'website':
                        $html .= '<div class="col-6"><div>'.$LOCALE->get(ucfirst($key)).'</div><div><a class="link-info" href="'.$value.'"><i class="me-1 bi bi-globe-americas"></i>'.$value.'</a></div></div>';
                        break;
                    case 'state':
                    case 'country':
                        if($value['name']){
                            $html .= '<div class="col-6"><div>'.$LOCALE->get(ucfirst($key)).'</div><div>'.$value['name'].'</div></div>';
                        }
                        break;
                    case 'tollfree':
                    case 'mobile':
                    case 'phone':
                    case 'fax':
                        $html .= '<div class="col-6"><div>'.$LOCALE->get(ucfirst($key)).'</div><div><a class="link-info" href="tel:'.$value.'"><i class="me-1 bi bi-telephone"></i>'.$value.'</a></div></div>';
                        break;
                    case 'tags':
                        $html .= '<div class="col-12"><div>'.$LOCALE->get(ucfirst($key)).'</div><div>';
                        foreach($value as $single){
                            $html .= '<span class="badge text-bg-warning m-1"><i class="me-1 bi bi-tag"></i>'.$single.'</span>';
                        }
                        $html .= '</div></div>';
                        break;
                    case 'industries':
                        $html .= '<div class="col-12"><div>'.$LOCALE->get(ucfirst($key)).'</div><div>';
                        foreach($value as $single){
                            $html .= '<span class="badge text-bg-info m-1"><i class="me-1 bi bi-crosshair"></i>'.$single.'</span>';
                        }
                        $html .= '</div></div>';
                        break;
                    case 'dba':
                    case 'name':
                        if(!in_array($vcard['category'],$avatarScope)){
                            $html .= '<div class="col-6"><div>'.$LOCALE->get(ucfirst($key)).'</div><div>'.$value.'</div></div>';
                        }
                        break;
                    case 'locale':
                        $html .= '<div class="col-6"><div>'.$LOCALE->get("Language").'</div><div>'.$LOCALE->list()[$value].'</div></div>';
                        break;
                    case 'role':
                        if(!in_array($vcard['category'],['Organization','Client','Lead'])){
                            $html .= '<div class="col-6"><div>'.$LOCALE->get(ucfirst($key)).'</div><div>';
                            foreach($value as $single){
                                $html .= '<span class="badge text-bg-warning me-2">'.$single.'</span>';
                            }
                            $html .= '</div></div>';
                        }
                        break;
                    case 'title':
                        if(!in_array($vcard['category'],['Organization','Client','Lead'])){
                            $html .= '<div class="col-6"><div>'.$LOCALE->get(ucfirst($key)).'</div><div><span class="badge text-bg-secondary">'.$value.'</span></div></div>';
                        }
                        break;
                    case 'businessNumber':
                    case 'taxExtension':
                    case 'importerExtension':
                        if(!in_array($vcard['category'],['Organization','Client','Lead'])){
                            break;
                        }
                    default:
                        $html .= '<div class="col-6"><div>'.$LOCALE->get(ucfirst($key)).'</div><div>'.$value.'</div></div>';
                        break;
                }
            }
        }
        if(in_array($vcard['category'],$avatarScope)){
            $html .= '</div>';
        }
        $html .= '</div>';
        $html .= '</div>';

        // Return the vCard
        return $html;
    }
}
