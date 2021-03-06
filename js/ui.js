/*******************************************************************************
    Common
*******************************************************************************/

function addProperty (target, name, value) {
  target.append(
    $('<tr>')
      .append($('<td>')
              .addClass('property-name')
              .text(name + ':'))
      .append($('<td>')
              .addClass('property-value')
              .append(value))
  );
}

function eventList (dmsObject) {
  let list = $('<ul/>', {
    'class': 'event-list'
  });
  for (let event of dmsObject.getHistory()) {
    let date = $('<div/>', {
      'class': 'event-date'
    }).text(event.date.toString());
    let description = $('<span/>', {
      'class': 'event-description'
    }).text(event.description);
    list.append(
      $('<li/>').append(date).append(description)
    );
  }
  return list;
}

function compileFiltersFromData (filterList) {
  let filters = [];
  for (let filterItem of filterList.find('li'))
    if (typeof $(filterItem).data('filter') != 'undefined')
      filters.push($(filterItem).data('filter'));
  return filters;
}

function dmsObjectList (prefix, infoPaneGenerator, filters, dmsForEach) {
  let list = $('<ul/>', {'class' : 'list-group'});
  
  let callback = new Callback().setCallback(function (dmsObject) {
    
        let name = $('<span/>', {'class': prefix+'-name', text: dmsObject.getName(), click: function () {
          informationPane.toggle();
          
        }});
        

        
        let informationPane = infoPaneGenerator(dmsObject);
        informationPane.hide();

        let item = $('<li/>').append(name).append(informationPane);
        list.append(item);
        
      }).addFilters(filters);
      
  dmsForEach(callback);
  return list;
}

function tagObjectList (prefix, infoPaneGenerator, filters, dmsForEach) {
  let list = $('<ul/>', {'class' : 'list-group'});
  
  let callback = new Callback().setCallback(function (dmsObject) {
    
    let clickable = $('<div><span class="tag-name">' + dmsObject.getName() + "</span><span class='form-control-feedback glyphicon glyphicon glyphicon-eye-open'></span></div>").click(function(){
      informationPane.toggle();
      
    });
        
        
        let informationPane = infoPaneGenerator(dmsObject);
        informationPane.hide();
        let item = $('<li/>', {'class':'list-group-item'}).append(clickable).append(informationPane);
        list.append(item);
        
      }).addFilters(filters);
      
  dmsForEach(callback);
  return list;
}

/*******************************************************************************
    Document management
*******************************************************************************/

function addDocumentFilterAsData (option, value, element) {
  switch (option) {
  case 'name':
    element.data('filter', function (doc) {
      return doc.getlName().includes(value);
    });
    break
  case 'owner':
    element.data('filter', function (doc) {
      return doc.getOwners().has(value);
    });
    break;
  case 'tag':
    element.data('filter', function (doc) {
      return doc.getTags().has(value);
    });
    break;
  case 'date':
    element.data('filter', function (doc) {
      return doc.getUploadDate().toDateString().includes(value);
    });
    break;
  default:
    console.error('Unknown filter option:', criterion.val());
  }
}
function searchDoc( pane , filterlist){
  let fileterItem = $('<li/>');
  addDocumentFilterAsData('name', $('#search').val().toLowerCase(),fileterItem);
  fileterItem.after(generateDocumentFilterItem(pane,fileterItem));
  refreshDocumentList(pane, filterlist);
  return fileterItem;
}

function generateDocumentFilterItem (pane, filterList) {
  let filterItem = $('<li/>');
  let criterion = $('<select/>',{class:'form-control'})
      .append($('<option/>').text('name'))
      .append($('<option/>').text('owner'))
      .append($('<option/>').text('tag'))
      .append($('<option/>').text('date'));
  let pattern = $('<input/>', { type: 'text',class:'form-control' });
  let addFilterButton = $('<button/>', {
    type: 'button',
    text: 'Add filter',
    click: function () {
      addDocumentFilterAsData(criterion.val(), pattern.val(), filterItem);
      addFilterButton.detach();
      filterItem.append(updateFilterButton);
      filterItem.after(generateDocumentFilterItem(pane, filterList));
      refreshDocumentList(pane, filterList);
    }
  });
  let updateFilterButton = $('<button/>', {
    type: 'button',
    text: 'Update filter',
    click: function () {
      addDocumentFilterAsData(criterion.val(), pattern.val(), filterItem);
      refreshDocumentList(pane, filterList);
    }
  }); 
  filterItem.append(criterion).append(pattern).append(addFilterButton);
  criterion.before('Filter results by ');
  criterion.after(': ');
  return filterItem;
}

function refreshDocumentList (targetPane, filterList) {
  targetPane.empty()
    .append(dmsObjectList('document',
                          documentInformationPane,
                          compileFiltersFromData(filterList),
                          DMS.forEachDocument));
}

function documentInformationPane (doc) {
  let detailsPane = $('<div/>', { 'class': 'document-details-pane' });
  let controlPane = $('<div/>', { 'class': 'document-control-pane' });
  let commentsPane = $('<div/>', { 'class': 'document-comments-pane' });
  let historyPane = $('<div/>', { 'class': 'document-history-pane' });


  //modal *************************** by wilbur.
        let mheader = $('<div/>',{'class':'modal-header'})
    let mbody = $('<div/>',{'class':'modal-body'})
        .append(detailsPane)
        .append(controlPane);
    let mfooter = $('<div/>',{'class':'modal-footer'});
    let mcontent = $('<div/>',{'class':'modal-content'})
        .append(mheader)
        .append(mbody)
        .append(mfooter);
    let mdialog = $('<div/>',{'class':'modal-dialog'}).append(mcontent);
    let mainPane = $('<div/>', { 'class': 'document-information-pane modal'})
        .attr('role','dialog')
        .attr('id','myModal')
        .append(mdialog);

    let closeButton = $('<button/>', {
        type: 'button',
        text: 'close',
        click: function () {
          mainPane.hide();
        }
    });
    mfooter.append(closeButton);

  // The details pane **********************************************************

  let details = $('<table/>', { 'class': 'document-details' });
  addProperty(details, 'File', doc.getFile());


    let owners = $('<input/>', {
    type: 'text',
      class:'form-control',
    readonly: true
  }).val(doc.ownersToString());
  addProperty(details, 'Owners', owners);
  
  let description = $('<textarea/>', {
    readonly: true
  }).val(doc.getDescription());
  addProperty(details, 'Description', description);

  let tags = $('<input/>', {
    type: 'text',
      class:'form-control',
    readonly: true
  }).val(doc.tagsToString());
  addProperty(details, 'Tags', tags);

  addProperty(details, 'Upload date', doc.getUploadDate().toDateString());

  if (DMS.canEdit(doc)) {
    var isprivate = $('<input/>', {
      type: 'checkbox',
        class:'form-control',
      disabled: true,
      checked: doc.isPrivate()
    });
    addProperty(details, 'Is private', isprivate);
  }
  
  detailsPane.append(details);

  // The control pane **********************************************************

  if (DMS.canEdit(doc)) {
    let editPane = $('<span/>').appendTo(controlPane);
    
    let updateButton = $('<button/>', {
      type: 'button',
      text: 'Update file',
      click: function () {
        $('<input/>', {
          type: 'file',
            class:'form-control',
          change: function () {
            if ($(this).val() != doc.getFile()) {
              alert('The new version of the file should have the same name.');
            } else {
              doc.updateFile($(this).val());
              DMS.updateDocument(doc);
              if (historyPane.is(':visible'))
                refreshHistoryPane();
            }
          }
        }).click();
      }
    });
    editPane.append(updateButton);
    
    let editButton = $('<button/>', {
      type: 'button',
      text: 'Edit details',
      click: function () {
        owners.prop('readonly', false);
        description.prop('readonly', false);
        tags.prop('readonly', false);
        isprivate.prop('disabled', false);
        
        updateButton.prop('disabled', true);
        editButton.detach();
        editPane.append(cancelButton).append(saveButton);
      }
    });
    editPane.append(editButton);
    
    let cancelButton = $('<button/>', {
      type: 'button',
      text: 'Cancel',
      click: function () {
        owners.val(doc.ownersToString()).prop('readonly', true);
        description.val(doc.getDescription()).prop('readonly', true);
        tags.val(doc.tagsToString()).prop('readonly', true);
        isprivate.prop('checked', doc.isPrivate()).prop('disabled', true);
        
        updateButton.prop('disabled', false);
        cancelButton.detach();
        saveButton.detach();
        editPane.append(editButton);
      }
    });

    let saveButton = $('<button/>', {
      type: 'button',
      text: 'Save',
      click: function () {
        let ownerList = parseCSV(owners.val());
        if (ownerList.length == 0) {
          alert('The document-owners group cannot become empty.');
          return;
        }

        let tagList = parseCSV(tags.val());
        if (tagList.length == 0) {
          alert('You have to specify at least one tag.');
          return;
        }
        
        doc.updateOwnersFromList(ownerList)
          .updateDescription(description.val())
          .updateTagsFromList(tagList)
          .makePrivate(isprivate.is(':checked'));
        DMS.updateDocument(doc);
        
        owners.prop('readonly', true);
        description.prop('readonly', true);
        tags.prop('readonly', true);
        isprivate.prop('disabled', true);

        if (historyPane.is(':visible'))
          refreshHistoryPane();

        updateButton.prop('disabled', false);
        cancelButton.detach();
        saveButton.detach();
        editPane.append(editButton);
      }
    });
  } // DMS.canEdit(doc)

  // The comments pane *********************************************************

  let refreshCommentsPane = function () {
    commentsPane.empty();
    
    let commentList = $('<ol/>', {
      'class': 'comment-list'
    });
    for (let comment of doc.getComments()) {
      let commentText = $('<div/>', {
        'class': 'comment-text'
      }).text(comment.text);
      let commentInfo = $('<span/>', {
        'class': 'comment-info'
      }).text(['by', comment.user,
               'on', comment.date.toDateString()].join(' '));
      commentList.append(
        $('<li/>').append(commentText).append(commentInfo)
      );
    }
    commentsPane.append(commentList);
    
    let newComment = $('<textarea/>',{class:'form-control'});
    let addComment = $('<button/>', {
      type: 'button',
      text: 'Add comment',
      click: function () {
        if (newComment.val() != '') {
          doc.addComment(DMS.createComment(newComment.val()));
          DMS.updateDocument(doc);
          refreshCommentsPane();
        }
      }
    });
    commentsPane.append(newComment).append(addComment);
  };
  let showCommentsButton = $('<button/>', {
    type: 'button',
    text: 'Show comments',
    click: function () {
      if (commentsPane.is(':visible')) {
        showCommentsButton.text('Show comments');
        commentsPane.detach();
      } else {
        showCommentsButton.text('Hide comments');
        commentsPane.appendTo(mainPane);
        refreshCommentsPane();
      }
    }  
  });
  controlPane.append(showCommentsButton);
  
  // The history pane **********************************************************

  let refreshHistoryPane = function () {
    historyPane.empty();
    let eventList = $('<ul/>', {
      'class': 'event-list'
    });
    for (let event of doc.getHistory()) {
      let date = $('<div/>', {
        'class': 'event-date'
      }).text(event.date.toString());
      let description = $('<span/>', {
        'class': 'event-description'
      }).text(event.description);
      eventList.append(
        $('<li/>').append(date).append(description)
      );
    }
    historyPane.append(eventList);
  };
  
  let showHistoryButton = $('<button/>', {
    type: 'button',
    text: 'Show history',
    click: function () {
      if (historyPane.is(':visible')) {
        showHistoryButton.text('Show history');
        historyPane.detach();
      } else {
        showHistoryButton.text('Hide history');
        historyPane.appendTo(mainPane);
        refreshHistoryPane();
      }
    }
  });
  controlPane.append(showHistoryButton);
  
  return mainPane;
};

/*******************************************************************************
    Tag management
*******************************************************************************/

function addTagFilterAsData (option, value, element) {
  switch (option) {
  case 'name':
    element.data('filter', function (doc) {
      return doc.getlName().includes(value);
    });
    break
  case 'owner':
    element.data('filter', function (doc) {
      return doc.getOwners().has(value);
    });
    break;
  case 'date':
    element.data('filter', function (doc) {
      return doc.getCreationDate().toDateString().includes(value);
    });
    break;
  default:
      element.data('filter', function (doc) {
          return doc.getName().includes(value);
      });
  }
}
let searchTag = function (pane,filterList){
    let filterItem = $('<li/>');
    addTagFilterAsData('name', $('#search').val().toLowerCase(), filterItem);
    filterItem.after(generateTagFilterItem(pane, filterList));
    refreshTagList(pane, filterList);
    return filterItem;
}
let generateTagFilterItem = function (pane, filterList) {
  let filterItem = $('<li/>');
  let criterion = $('<select/>',{'class':'form-control'})
      .append($('<option/>').text('name'))
      .append($('<option/>').text('owner'))
      .append($('<option/>').text('date'));
  let pattern = $('<input/>', { type: 'text',class:'form-control' });
  let addFilterButton = $('<button/>', {
    type: 'button',
    text: 'Add filter',
    click: function () {
      addTagFilterAsData(criterion.val(), pattern.val(), filterItem);
      addFilterButton.detach();
      filterItem.append(updateFilterButton);
      filterItem.after(generateTagFilterItem(pane, filterList));
      refreshTagList(pane, filterList);
    }
  });
  let updateFilterButton = $('<button/>', {
    type: 'button',
    text: 'Update filter',
    click: function () {
      addTagFilterAsData(criterion.val(), pattern.val(), filterItem);
      refreshTagList(pane, filterList);
    }
  });
  filterItem.append(criterion).append(pattern).append(addFilterButton);
  criterion.before('Filter results by ');
  criterion.after(': ');
  return filterItem;
}

function refreshTagList (targetPane, filterList) {
  targetPane.empty()
    .append(tagObjectList('tag',
                          tagInformationPane,
                          compileFiltersFromData(filterList),
                          DMS.forEachTag));
}

function tagInformationPane (tag) {
  let detailsPane = $('<div/>', { 'class': 'tag-details-pane' });
  let controlPane = $('<div/>', { 'class': 'tag-control-pane' });
  let historyPane = $('<div/>', { 'class': 'tag-history-pane' });
  
  let mainPane = $('<div/>', { 'class': 'tag-information-pane' })
      .append(detailsPane)
      .append(controlPane);
  
  // The details pane **********************************************************

  let details = $('<table/>', { 'class': 'tag-details' });
  addProperty(details, 'Name', tag.getName());

  let owners = $('<input/>', {
    type: 'text',
      class:'form-control',
    readonly: true
  }).val(tag.ownersToString());
  addProperty(details, 'Owners', owners);
  
  let description = $('<textarea/>', {
    readonly: true,
      class:'form-control'
  }).val(tag.getDescription());
  addProperty(details, 'Description', description);

  addProperty(details, 'Creation date', tag.getCreationDate().toDateString());

  detailsPane.append(details);

  // The control pane **********************************************************

  if (DMS.canEdit(tag)) {
    let editPane = $('<span/>').appendTo(controlPane);

    let editButton = $('<a class="btn btn-warning btn-sm ">Edit Details</a>').click(function(){
                          owners.prop('readonly', false);
                          description.prop('readonly', false);
                          
                          editButton.detach();
                          editPane.append(cancelButton).append(saveButton);
    });
    
    editPane.append(editButton);
    
    let cancelButton = $('<a class="btn btn-warning btn-sm ">Cancel</a>').click(function(){
        owners.val(tag.ownersToString()).prop('readonly', true);
        description.val(tag.getDescription()).prop('readonly', true);
        
        cancelButton.detach();
        saveButton.detach();
        editPane.append(editButton);
    });
    
    /*
    let cancelButton = $('<button/>', {
      type: 'button',
      text: 'Cancel',
      click: function () {
        owners.val(tag.ownersToString()).prop('readonly', true);
        description.val(tag.getDescription()).prop('readonly', true);
        
        cancelButton.detach();
        saveButton.detach();
        editPane.append(editButton);
      }
    });
    */

    let saveButton = $('<a class="btn btn-success btn-sm ">Save</a>').click(function(){
        let ownerList = parseCSV(owners.val());
        if (ownerList.length == 0) {
          alert('The document-owners group cannot become empty.');
          return;
        }

        tag.updateOwnersFromList(ownerList)
          .updateDescription(description.val());
        DMS.updateTag(tag);

        owners.prop('readonly', true);
        description.prop('readonly', true);

        cancelButton.detach();
        saveButton.detach();
        editPane.append(editButton);
    });
    
    /*
    let saveButton = $('<button/>', {
      type: 'button',
      text: 'Save',
      click: function () {
        let ownerList = parseCSV(owners.val());
        if (ownerList.length == 0) {
          alert('The document-owners group cannot become empty.');
          return;
        }

        tag.updateOwnersFromList(ownerList)
          .updateDescription(description.val());
        DMS.updateTag(tag);

        owners.prop('readonly', true);
        description.prop('readonly', true);

        cancelButton.detach();
        saveButton.detach();
        editPane.append(editButton);
      }
    });
    */
    
    let deleteButton = $('<a class="btn btn-danger btn-sm ">Delete Tag</a>').click(function(){
        DMS.deleteTag(tag, {
          onerror: function () {
            alert('There are documents still associated with this tag.');
          },
          oncomplete: function () {
            $('#listTagsButton').click();
          }
        });
    });
    
    
    /*
    let deleteButton = $('<button/>', {
      type: 'button',
      text: 'Delete tag',
      click: function () {
        DMS.deleteTag(tag, {
          onerror: function () {
            alert('There are documents still associated with this tag.');
          },
          oncomplete: function () {
            $('#listTagsButton').click();
          }
        });
      }
    });
    */
    
    controlPane.append(deleteButton);

    let mapButton = $('<a class="btn btn-primary btn-sm ">Map Tag</a>').click(function(){
        let newTagName = prompt('To which tag would you like to map \'' +
                                tag.getName() + '\'?');
        if (newTagName != null)
          DMS.mapTag(tag, newTagName, {
            oncomplete: function () {
              $('#listTagsButton').click();
            }
          });
    });

    /*
    let mapButton = $('<button/>', {
      type: 'button',
      text: 'Map tag',
      click: function () {
        let newTagName = prompt('To which tag would you like to map \'' +
                                tag.getName() + '\'?');
        if (newTagName != null)
          DMS.mapTag(tag, newTagName, {
            oncomplete: function () {
              $('#listTagsButton').click();
            }
          });
      }
    });
    */
    
    controlPane.append(mapButton);
  } // DMS.canEdit(tag)
  
  // The history pane **********************************************************

  let showHistoryButton = $('<a class="btn btn-info btn-sm ">Show History</a>').click(function(){
    if (historyPane.is(':visible')) {
        showHistoryButton.text('Show history');
        historyPane.detach();
      } else {
        showHistoryButton.text('Hide history');
        historyPane.empty().append(eventList(tag));
        historyPane.appendTo(mainPane);
      }
  });

/*
  let showHistoryButton = $('<button/>', {
    type: 'button',
    text: 'Show history',
    click: function () {
      if (historyPane.is(':visible')) {
        showHistoryButton.text('Show history');
        historyPane.detach();
      } else {
        showHistoryButton.text('Hide history');
        historyPane.empty().append(eventList(tag));
        historyPane.appendTo(mainPane);
      }
    }
  });
  
  */
  controlPane.append(showHistoryButton);

  return mainPane;
}
