SELECT deployment_id, host_id, status from deployment_host_mappings
WHERE deployement_id = ANY($1); 