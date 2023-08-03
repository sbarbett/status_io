(function () {
  var client = ZAFClient.init();

  client.invoke('resize', { width: '100%', height: '200px' });

  client.metadata().then(function(metadata) {
    var headers = {
      'x-api-key': metadata.settings['API Key'],
      'x-api-id': metadata.settings['API ID']
    }

    var statuspageId = metadata.settings['Status Page ID'];
    var incidentForm = document.getElementById('incident-form');
    var createIncidentButton = document.getElementById('create-incident');
    var resolveIncidentButton = document.getElementById('resolve-incident');
    var infrastructureAffectedSelect = document.getElementById('infrastructure-affected');

    createIncidentButton.addEventListener('click', function() {
      // Show the form when the create incident button is clicked
      incidentForm.style.display = 'block';
    });

    // Request the list of components when the page loads
    client.request({
      url: `https://api.status.io/v2/component/list/${statuspageId}`,
      type: 'GET',
      headers: headers,
      cors: false
    }).then(function(response) {
      var components = response.result;
      // Loop over the components and create an option for each one
      components.forEach(function(component) {
        var option = document.createElement('option');
        option.value = `${component._id}-${component.containers[0]._id}`; // Use the component and container IDs as the option value
        option.text = `${component.name} - ${component.containers[0].name}`; // Use the component and container names as the option text
        infrastructureAffectedSelect.appendChild(option);
      });
    }).catch(function(error) {
      console.log('Error fetching components:', error);
    });

    incidentForm.addEventListener('submit', function(event) {
      // Prevent the form from submitting normally
      event.preventDefault();

      client.get('ticket').then(function(data) {
        var ticketId = data.ticket.id;

        // Get the values from the form fields
        var incidentName = document.getElementById('incident-name').value;
        var incidentDetails = document.getElementById('incident-details').value;
        var infrastructureAffected = document.getElementById('infrastructure-affected').value;
        var currentStatus = document.getElementById('current-status').value;
        var currentState = document.getElementById('current-state').value;
        var social = document.getElementById('social').checked ? '1' : '0';

        var options = {
          url: 'https://api.status.io/v2/incident/create',
          type: 'POST',
          contentType: 'application/json',
          cors: false,
          headers: headers,
          data: JSON.stringify({
            statuspage_id: metadata.settings['Status Page ID'],
            infrastructure_affected: [infrastructureAffected],
            incident_name: `INC${ticketId}: ${incidentName}`,
            incident_details: incidentDetails,
            current_status: parseInt(currentStatus, 10),
            current_state: parseInt(currentState, 10),
            social: social
          })
        }

        client.request(options).then(function(response) {
          // Hide the form after the incident is created
          incidentForm.style.display = 'none';

          console.log('Response:', response)
          client.set(`ticket.customField:custom_field_${response.result}`, response.result);
        }).catch(function(error) {
          console.log('Error:', error)
        });
      });
    });

    resolveIncidentButton.addEventListener('click', function() {
      client.get('ticket').then(function(data) {
        var incidentId = data.ticket[`customField:custom_field_${incident.id}`];

        client.request({
          url: `https://api.status.io/v2/incident/resolve/${incidentId}`,
          type: 'POST',
          contentType: 'application/json',
          cors: false,
          headers: headers,
          data: JSON.stringify({
            statuspage_id: statuspageId,
            incident_id: incidentId,
            incident_details: `Incident resolved from ZenDesk ticket #${data.ticket.id}`,
            incident_status: 'Resolved'
          })
        });
      });
    });
  });
})();