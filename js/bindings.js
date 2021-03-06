$(document).ready(function() {

  $('#addDefaultObjectsButton').click();
  // User management ***********************************************************

  let loggedIn = $('#loggedIn');
  let loggedOut = $('#loggedOut');
  let filterList = $('<ol/>', {'class': 'tag-filter-list'});
  let tagListPane = $('<div/>', {'class': 'tag-list-pane list-group'});
  var firstFilter = 0;
  let listTagsPane = $('#listTagsPane');
  var hiddenCheck = true;
  
  $('#logInButton').click(function () {
    DMS.logIn($('#userName').val(), {
      onsuccess: function () {
        loggedOut.detach();
        $(document.body).append(loggedIn.show( function() {

          $('#tagsMain').addClass('hidden');

          hiddenCheck = true;

        }));
        
        $('#loggedInAs').append('').append($('<span/>', {'class': 'user-name'}).text(DMS.getUserName()));

      },
      onerror: function () {
        alert("Unable to log in.");
      }
    });
  });

  $('#logOutButton').click(function () {
    DMS.logOut();
    $('#loggedInAs').empty();

    loggedIn.detach();
    $(document.body).append(loggedOut.show());
  });

  // Admin *********************************************************************
  
  $('#resetButton').click(function () {
    DMS.clearStores();
    $('#documentsMain').children().empty();
    $('#tagsMain').children().empty();
  });

  $('#addDefaultObjectsButton').click(function () {
    // From National Geographic: Photo of the Day - Best of January
      DMS.clearStores();
      $('#documentsMain').children().empty();
      $('#tagsMain').children().empty();

    DMS.uploadDocument(
      'Carved-in-Stone.jpeg', 'Carved-in-Stone.jpeg', ['NatGeo'],
      'Glacial river water conjures an evanescent mist at the Norwegian rock '+
        'formation known as Marmorslottet (the Marble Castle). Located in Mo i ' +
        'Rana, the Marble Castle is limestone that has been carved into ' +
        'sinuous-looking curves by the rushing river fed by the Svartisen ' +
        'glacier, Norway’s second largest.',
      ['river', 'water', 'Norwegian', 'Marmorslottet', 'Marble Castle',
       'Mo i Rana', 'limestone', 'Svartisen', 'glacier', 'Norway'],
    false);


    DMS.uploadDocument(
      'We-Have-Liftoff.jpeg', 'We-Have-Liftoff.jpeg', ['NatGeo'],
      'Along the Zambezi River in northern Namibia, a giant flock of southern ' +
        'carmine bee-eaters (Merops nubicoides) scatters into the ' +
        'air. According to Your Shot photographer Jason Boswell, these birds ' +
        'were taking off as a group of bird ringers attempted to ring a few ' +
        'hundred of them to gather more information on where they go when they' +
        'leave these breeding grounds. Today is National Bird Day in the United ' +
        'States; the holiday coincides with the Christmas Bird Count, a ' +
        'citizen-led project to take stock of the health of the country’s ' +
        'birds.',
      ['Zambezi River', 'Namibia', 'bee', 'Jason Boswell', 'birds'],
    false);

    DMS.uploadDocument(
      'Hanging-Around.jpeg', 'Hanging-Around.jpeg', ['NatGeo'],
      'Photographer Mike Melnotte was out for a walk with his family near ' +
        'Fort Fisher in North Carolina. Near a grove of oak trees, he came ' +
        'across some friends relaxing and was struck by the way they sat in ' +
        'silence and simply watched the sunset.',
      ['Mike Melnotte', 'Fort Fisher', 'North Carolina', 'oak', 'trees',
       'friends', 'sunset'],
    false);

    DMS.uploadDocument(
      'You-Can-Run.jpeg', 'You-Can-Run.jpeg', ['NatGeo'],
      'On the shore of Kurile Lake, a remnant of the volcano that was once ' +
        'active on this site in Kamchatka, Russia, competition for a meal can ' +
        'be fierce—and this brown bear isn’t letting his smaller rival get ' +
        'close to steal any salmon away. This photograph wasn’t easy to come ' +
        'across for Your Shot photographer Giuseppe D’amico—it required ' +
        '“stalking of the small beaches on the shores of the lake. This picture ' +
        'is the result of these ambushes and was taken in the early morning, ' +
        'from a distance of about 30 meters.” Despite the battle for a fish ' +
        'here, Kurile Lake is one of the world’s largest spawning sites for ' +
        'sockeye salmon.',
      ['Kurile Laku', 'volcano', 'Kamchatka', 'Russia', 'brown bear',
       'Giuseppe D’amico', 'battle', 'fish', 'Kurile Lake', 'salmon'],
    false);
    
    DMS.uploadDocument(
      'Wipeout.jpeg', 'Wipeout.jpeg', ['NatGeo'],
      'A riderless surfboard soars above a massive wave on Peahi, a surf' +
        'break on Maui’s north shore. This image was captured during the Pe’ahi' +
        'Challenge, a big-wave surfing event. Peahi, also known as Jaws, “is a' +
        'spectacle in the truest sense of the word, with waves up to 80 [feet' +
        'tall] on the biggest days,” photographer Lyle Krannichfeld says. “This' +
        'particular frame stood out to me because of the splash of color from' +
        'the board and the questions it raises for the viewer.”',
      ['surfboard', 'wave', 'Peahi', 'Maui', 'Pe’ahi Challenge', 'Lyle Krannichfeld'],
    false);

    //$('#listDocumentsButton').click();
    //$('#listTagsButton').click();
  });
  
  // Document management *******************************************************
  
  $('#uploadDocumentButton').show(function () {
    let uploadDocumentPane = $('#uploadDocumentPane');
    uploadDocumentPane.empty().show().siblings().hide();

    let details = $('<table/>', { 'class': 'document-details' });

    let file = $('<input/>', { type: 'file', class:'form-control' });
    addProperty(details, 'File', file);

    let additionalOwners = $('<input/>', { type: 'text', class:'form-control' });
    addProperty(details, 'Additional owners', additionalOwners);
    
    let description = $('<textarea/>',{class:'form-control'});
    addProperty(details, 'Description', description);

    let tags = $('<input/>', { type: 'text', class:'form-control' });
    let generateTags = $('<button/>', {
      type: 'button',
      text: 'Generate tags',
      click: function () {
        tags.val(extractTagNames(description.val()).join(', '));
      }
    });
    addProperty(details, 'Tags',
                $('<span/>').append(tags).append(generateTags));

    let isprivate = $('<input/>', {
      type: 'checkbox',
        class:'form-control',
      checked: true
    });
    addProperty(details, 'Is private', isprivate);

    let uploadButton = $('<button/>', {
      type: 'button',
      text: 'Upload',
      click: function () {
        if (file.val() == '') {
          alert('Please select a file.');
          return;
        }
        let fileName = file.val().replace(/^.*[\\\/]/, '');
        let ownerList = parseCSV(additionalOwners.val());
        let tagList = parseCSV(tags.val());
        if (tagList.length == 0) {
          alert('You have to specify at least one tag.');
          return;
        }
        DMS.uploadDocument(
          fileName,
          fileName, // At the moment, we are not storing the actual
                    // file, but just their name.
          ownerList,
          description.val(),
          tagList,
          isprivate.is(':checked'), {
            oncomplete: function () {
              uploadDocumentPane.hide();
              $('#listDocumentsButton').click();
            }
          });        
      }
    });
    
    uploadDocumentPane.append(details).append(uploadButton);
  });

  $('#listDocumentsButton').click(function () {
    let listDocumentsPane = $('#listDocumentsPane');
    listDocumentsPane.empty().show().siblings().hide();

    let filterList = $('<ol/>', {
      'class': 'document-filter-list'
    }).appendTo(listDocumentsPane);
    let documentListPane = $('<div/>', {
      'class': 'document-list-pane'
    }).appendTo(listDocumentsPane);

    filterList.append(generateDocumentFilterItem(documentListPane, filterList));
    refreshDocumentList(documentListPane, filterList);
  });

  //************* search bar to search documents ***********//
    let dlist = $('#documentListPane');
  $('#search').keyup(function () {
      let listDocumentsPane = $('#listDocumentsPane');
      listDocumentsPane.empty().show().siblings().hide();
    if ($(this).val() != '') {

        let filterList = $('<ol/>', {
            'class': 'document-filter-list'
        }).appendTo(listDocumentsPane);
        let documentListPane = $('<div/>', {
            'class': 'document-list-pane'
        }).appendTo(listDocumentsPane);

        filterList.append(searchDoc(documentListPane, filterList));
        refreshDocumentList(documentListPane, filterList);
    }else{
        let documentListPane = $('<div/>', {
            'class': 'document-list-pane'
        }).appendTo(listDocumentsPane);
        refreshDocumentList(documentListPane, dlist);
        filterList.empty();
    }
    });



  // Tag management ************************************************************

  $('#newTagButton').click(function () {
    let createTagPane = $('#createTagPane');
    createTagPane.empty().show().siblings().hide();

    let details = $('<table/>', { 'class': 'tag-details' });

    let name = $('<input/>', { type: 'text',class:'form-control' });
    addProperty(details, 'Name', name);

    let additionalOwners = $('<input/>', { type: 'text',class:'form-control' });
    addProperty(details, 'Additional owners', additionalOwners);

    let description = $('<textarea/>',{class:'form-control'});
    addProperty(details, 'Description', description);

    let createTagButton = $('<button/>', {
      type: 'button',
      text: 'Create tag',
      click: function () {
        let ownerList = parseCSV(additionalOwners.val());
        DMS.createTag(name.val(), ownerList, description.val(), {
          oncomplete: function () {
            createTagPane.hide();
            $('#listTagsButton').click();
          }
        });
      }
    });

    createTagPane.append(details).append(createTagButton);
  });

  $('#listTagsButton').click(function () {
    listTagsPane.empty().show().siblings().hide();
    tagListPane.appendTo(listTagsPane);
    refreshTagList(tagListPane, filterList);
    
    $("#tagsMain").toggleClass('hidden');
    
    hiddenCheck = !hiddenCheck;
    
    if(hiddenCheck == true){
      $('#tagIcon').addClass('glyphicon-chevron-left');
      $('#tagIcon').removeClass('glyphicon-chevron-down');
    }else{
      $('#tagIcon').addClass('glyphicon-chevron-down');
      $('#tagIcon').removeClass('glyphicon-chevron-left');
    }
    
  });

let list = $('#listTagsPane');

  $('#search').keyup(function () {

      if ($(this).val() != '') {
          let listTagsPane = $('#listTagsPane');
          //listTagsPane.empty().show().siblings().hide();
          filterList.append(searchTag(tagListPane, filterList));
          refreshTagList(tagListPane, filterList);
      }else{
          refreshTagList(tagListPane, list);
          filterList.empty();
      }
  });
  
  //Puts the filter tags section in the modal
  $('#tagFilter').click(function () {
    let filterPane = $('#tagFilterBody');
    
    //only create a filter search on first instance
    if(firstFilter == 0){
      filterPane.append(filterList);
      filterList.append(generateTagFilterItem(tagListPane, filterList));
      firstFilter = 1;
    }
    
    refreshTagList(tagListPane, filterList);
  });
  
  $('#removeFiltersButton').click(function () {
    let filterPane = $('#tagFilterBody');
    filterList.empty();
    filterPane.append(filterList);
    filterList.append(generateTagFilterItem(tagListPane, filterList));
    refreshTagList(tagListPane, filterList);
  });



    $('#mClose').onclick(function(){
        $('.document-details.pane').css("background-color", "red");
    });
  //toggle the tag-information-pane to show it, they already loaded
});
