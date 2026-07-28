export function flattenContent(content=[]){
  const lines=[];
  for(const block of content){
    if(block.type==='paragraph'||block.type==='heading')lines.push(block.text);
    else if(block.type==='list')lines.push(...block.items.map(item=>`• ${item}`));
    else if(block.type==='see-also')lines.push('SEE ALSO',...block.items.map(item=>`• ${item}`));
    else if(block.type==='comparison-table'){
      lines.push(...block.columns);
      for(const row of block.rows)lines.push(row.label,...row.cells);
    }else if(block.type==='matrix'){
      if(block.caption)lines.push(block.caption);
      lines.push(...block.rows.map(row=>`${row.condition}: ${row.result}`));
    }else if(block.type==='procedure'){
      for(const step of block.steps){
        lines.push(`${step.label}: ${step.text}`.trim());
        lines.push(...(step.items||[]).map(item=>`• ${item}`));
      }
    }else if(block.type==='named-stages'){
      for(const stage of block.stages){
        lines.push(`${stage.label}: ${stage.text}`.trim());
        lines.push(...(stage.items||[]).map(item=>`• ${item}`));
      }
    }
  }
  return lines.filter(Boolean).join('\n');
}

export function recordText(record){
  return record?.content?flattenContent(record.content):String(record?.text||'');
}
