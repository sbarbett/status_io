(function () {
  var client = ZAFClient.init();
  client.invoke('resize', { width: '100%', height: '200px' });
  client.on('app.registered', init);

  function init() {
    var createIncidentButton = document.getElementById('create-incident');

    createIncidentButton.addEventListener('click', function() {
      client.context().then(create_modal);
    });
  }

  function create_modal(context) {
    var parent_guid = context.instanceGuid;
    var options = {
      location: 'modal',
      url: 'assets/modal.html#parent_guid=' + parent_guid
    }
    client.invoke('instances.create', options)
  }

  // client.metadata().then(function(metadata) {
  //   var headers = {
  //     'x-api-key': metadata.settings['API Key'],
  //     'x-api-id': metadata.settings['API ID']
  //   }

  //   var createIncidentButton = document.getElementById('create-incident');

  //   createIncidentButton.addEventListener('click', function() {
  //     console.log('Context', client.context)
  //     client.context().then(function(context) {
  //       console.log('Context', context)
  //       // var parent = client.context.instanceGuid;
  //       // console.log('Parent', parent)
  //       var parent = context.instanceGuid;
  //       console.log('Parent', parent)
  //       client.invoke('instances.create', {
  //         location: 'modal', 
  //         url: 'assets/modal.html#parent_guid=' + parent, 
  //         size: {
  //           width: '80vw', 
  //           height: '80vh'
  //         }
  //       }).then(function(modalContext) {
  //         var modalClient = client.instance(modalContext['instances.create'][0].instanceGuid);
  //         modalClient.on('modal.close', function() {
  //           console.log('The modal has been closed');
  //         });
  //       });
  //     });
  //   });
  // });
})();