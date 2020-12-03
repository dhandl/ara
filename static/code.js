$( document ).ready(function() {
    fillTable();
});

function showModal() {
$('#ruleModal').modal('show');
};
function fillTable() {
    var table = $('#ruleTable');
     $.ajax({
       url: 'api/get_rules',
       dataType: 'json',
       success: function(data) {
           $('#ruleTable').bootstrapTable({
              data: data,
              columns: [ {},{},{},{},{},
                {
                  field: 'operate',
                  title: '',
                  align: 'right',
                  valign: 'middle',
                  clickToSelect: false,
//                  formatter : function(value, row, index) {
//                    return '<button class=\'btn btn-primary \' ><i class=\"la la-bars\"></i></button><button class=\'btn btn-primary mx-2\' ><i class=\"la la-trash\"></i></button>';
//                  }
                  formatter : TableActions
                }
                ]
           });
       },
       error: function(e) {
           console.log(e.responseText);
       }
    });
};

function TableActions (value, row, index) {
    return [
        '<a class="like" href="javascript:editRule('+row.id+')" title="Edit">',
        '<i class="la la-pencil"></i>',
        '</a> ',
        '<a class="danger remove" href="javascript:void(0)" data-id="'+row.id+'" title="Remove">',
        '<i class="la la-trash"></i>',
        '</a>'
    ].join('');
}
function stateFormatter(value, row, index) {
  return {
    checked: row.enabled,
    disabled: true
  }
}


function openRuleModal(data) {
    $('#inputRuleName').val(data.name);
    $('#checkRuleActive').attr("checked", data.enabled == 'true' ? true : false);
    $('#textRuleLogic').val(JSON.stringify(data.logic, null, 1));
    $('#textRuleActions').val(JSON.stringify(data.actions, null, 1));
    $('#ruleModal').modal('show');
}

function editRule(id) {
   $.ajax({
       url: 'api/get_rule/' + id,
       dataType: 'json',
       success: function(data) {
        console.log(JSON.stringify(data))
        openRuleModal(data)
       },
       error: function(e) {
           console.log(e.responseText);
       }
    });
}

function addRule(id) {
    openRuleModal({
        name: '',
        enabled: true,
        logic: {},
        actions: []
    });
}