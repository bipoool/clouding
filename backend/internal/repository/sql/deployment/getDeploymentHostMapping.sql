SELECT deployment_id, host_id, status from deployment_host_mappings
WHERE deployment_id = ANY($1); 