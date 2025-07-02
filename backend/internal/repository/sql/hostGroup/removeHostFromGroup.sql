DELETE FROM host_groups_to_host_mapping
WHERE host_id=$1 AND host_group_id=$2;