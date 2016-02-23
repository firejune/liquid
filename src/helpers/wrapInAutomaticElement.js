export default function wrapInAutomaticElement(generatedElement, insertSubElement) {
  if (!insertSubElement) {
    insertSubElement = generatedElement;
  }

  const dropCall = app.dropCall;
  const args = dropCall.arguments;
  const obj = dropCall.object;
  const method = dropCall.method;

  args[0] = generatedElement;
  obj[method].apply(obj, args);

  app.context.history.add({
    name: `Create Automatic ${generatedElement.getName()}`,
    undo: () => {
      generatedElement.remove();
      obj.update();
    },
    redo: () => {
      obj[method].apply(obj, args);
      obj.update();
    }
  });

  app.dropCall.object = insertSubElement;
  app.dropCall.method = 'insertFirst';
  app.dropCall.arguments = [app.draggedComponent];
}
