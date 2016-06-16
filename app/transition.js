/**
 * Created by faisal on 3/4/15.
 */

export default function() {
  this.transition(
    this.fromRoute('info'),
    this.toRoute('zcompare'),
    this.use('toLeft'),
    this.reverse('toRight')
  );

  this.transition(
    this.fromRoute('zcompare'),
    this.toRoute('browse'),
    this.use('toLeft'),
    this.reverse('toRight')
  );
}
