<?php

/**
 * Core Framework - VcardsModel
 *
 * @license    MIT (https://mit-license.org/)
 * @author     Louis Ouellet <louis@laswitchtech.com>
 */

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Abstracts\Model;

class VcardsModel extends Model {

    /**
     * Retrieve vCards
     *
     * @param int $organization
     * @return array
     */
    public function list(int $organization): array
    {
        // Create the Query
        $Query = $this->Database->query()
            ->table('vcards')
            ->select('*')
            ->join('owner', 'users', 'username')
            ->join('state', 'states', 'code')
            ->join('country', 'countries', 'code')
            ->join('organization', 'organizations', 'id')
            ->order('id', 'ASC')
            ->filter()
            ->where('id', 9999, '<>')
            ->filter()
            ->where('organization', $organization);

        // Retrieve the Results
        $result = $Query->result();

        // Decode JSON Fields
        foreach($result as $key => $record){
            $result[$key]['tags'] = json_decode($record['tags'] ?? '[]', true);
            $result[$key]['industries'] = json_decode($record['industries'] ?? '[]', true);
        }

        // Return the Results
        return $result;
    }

    /**
     * Retrieve vCards's Details
     *
     * @param int $id
     * @return array
     */
    public function get(int $id): array
    {
        // Create the Query
        $Query = $this->Database->query()
            ->table('vcards')
            ->select('*')
            ->join('owner', 'users', 'username')
            ->join('state', 'states', 'code')
            ->join('country', 'countries', 'code')
            ->join('organization', 'organizations', 'id')
            ->join('avatar', 'files', 'id')
            ->order('id', 'ASC')
            ->filter()
            ->where('id', 9999, '<>')
            ->filter()
            ->where('id', $id)
            ->limit(1);

        // Retrieve the Results
        $result = $Query->result();

        // Decode JSON Fields
        foreach($result as $key => $record){
            $result[$key]['tags'] = json_decode($record['tags'] ?? '[]', true);
            $result[$key]['industries'] = json_decode($record['industries'] ?? '[]', true);
            $result[$key]['organization']['users'] = json_decode($record['organization']['users'] ?? '[]', true);
        }

        // Return the Results
        return $result[array_key_first($result)] ?? [];
    }

    /**
     * Create a new vCard and return the id
     *
     * @param array $data
     * @return int
     */
    public function create(array $data): int
    {
        // Create the Query
        $Query = $this->Database->query()
            ->table('vcards')
            ->insert($data);

        // Execute the Query
        $affectedRows = $Query->execute();

        // Execute the Query
        return $Query->lastId();
    }

    /**
     * Update a vCard
     *
     * @param int $id
     * @param array $data
     * @return int
     */
    public function update(int $id, array $data): int
    {
        // Create the Query
        $Query = $this->Database->query()
            ->table('vcards')
            ->update($data)
            ->where('id', $id);

        // Execute the Query
        return $Query->execute();
    }

    /**
     * Describe the vCards Table
     *
     * @return array
     */
    public function describe(): array
    {
        return $this->Database->schema()->define('vcards')->describe();
    }
}
