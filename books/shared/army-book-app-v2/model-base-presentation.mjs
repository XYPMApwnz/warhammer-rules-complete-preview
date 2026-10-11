/** Format existing model/base bindings; never establish ownership from captions. */
export function modelBaseDisplayValue(base, siblings, resolve, members) {
  const bindings = base.data.scopeBindings;
  const hasExceptions = siblings.some(sibling => new Set(sibling.data.scopeBindings.map(binding => binding.value)).size > 1);
  if (siblings.length === 1 && new Set(bindings.map(binding => binding.value)).size === 1) return undefined;
  const requireOwner = (id, kind) => {
    const entity = resolve(id);
    if (entity?.kind !== kind || entity.ownerId !== base.ownerId)
      throw new TypeError('Invalid model-base presentation recipient: ' + id);
    return entity;
  };
  return bindings.map(binding => {
    const recipients = binding.compositionMemberSourceIds.map(id => requireOwner(id, 'COMPOSITION_MEMBER'));
    const profiles = binding.modelProfileSourceIds.map(id => requireOwner(id, 'MODEL_PROFILE'));
    if (!recipients.length || !profiles.length) throw new TypeError('Missing model-base presentation scope');
    const recipientIds = new Set(recipients.map(member => member.id));
    // A profile caption is safe only when the binding covers that entire profile.
    // Exceptions within a profile keep their exact composition-member captions.
    const fullProfiles = !hasExceptions && profiles.every(profile => {
      const profileMembers = members.filter(member => resolve(member.data.composition.modelProfileSourceId)?.id === profile.id);
      return profileMembers.length && profileMembers.every(member => recipientIds.has(member.id));
    }) && recipients.every(member => profiles.some(profile => resolve(member.data.composition.modelProfileSourceId)?.id === profile.id));
    const names = fullProfiles ? profiles.map(profile => profile.data.name) : recipients.map(member => member.data.composition.name);
    return names.join(' / ') + ': ⌀' + binding.value;
  }).join('; ');
}
