<template>
  <div>

    <v-collapsible expand>
        <li>
            <v-collapsible-header>
              <v-icon class="yellow-text darken-1">description</v-icon>
              <v-chip class="yellow darken-1 white-text">
                  Mission critical siloes are becoming innovative driver experts.
              </v-chip>
            </v-collapsible-header>
            <v-collapsible-body>
                <p>We aim to intelligently connect our proposition by globally virtualising our value-added best-in-class innovations. Is your diversity prepared for seamless organic growth growth? Mission critical siloes are becoming innovative driver experts. Our Corporate Paradigm Shift solution offers synergies a suite of holistic offerings.</p>
            </v-collapsible-body>
        </li>
        <li>
            <v-collapsible-header>
              <v-icon class="green-text">link</v-icon>
              <v-chip class="green white-text">
                  Project Stories
              </v-chip>
            </v-collapsible-header>
            <v-collapsible-body>
                <p>
                  <a href="https://www.pivotaltracker.com/n/projects/1929407" target="_blank">
                    https://www.pivotaltracker.com/n/projects/1929407
                  </a>
                </p>
            </v-collapsible-body>
        </li>
        <li>
            <v-collapsible-header>
              <span class="collection-item avatar"><img src="http://fillmurray.com/500/500" alt="" class="circle"></span> Bill Murray
              <span href="#!" class="secondary-content"><i class="material-icons orange-text">comment</i></span>
            </v-collapsible-header>
            <v-collapsible-body>
                <p>
                  Senior verticals dynamically enable end-to-end step-changes for our enterprises. Unparalleled core assets conservatively enable knowledge transfer game changers for our bandwidths.
                </p>
            </v-collapsible-body>
        </li>
        <li>
            <v-collapsible-header>
              <i class="material-icons blue-text">live_help</i> Bill Murray
              <span class="secondary-content collection-item avatar"><img src="http://fillmurray.com/500/500" alt="" class="circle"></span>
            </v-collapsible-header>
            <v-collapsible-body>
                <p>
                  So we can hit the ground running, we will be ethically synergising every ballpark figure in our space.
                </p>
            </v-collapsible-body>
        </li>
    </v-collapsible>
    <a class="btn-floating yellow darken-1 actionButton waves-effect waves-light" v-tooltip:position="'Add a description or definition.'">
      <i class="material-icons">description</i>
    </a>
    <a class="btn-floating green actionButton waves-effect waves-light" v-tooltip:position="'Add a link.'">
      <i class="material-icons">link</i>
    </a>
    <a class="btn-floating orange actionButton waves-effect waves-light" v-tooltip:position="'Add a comment.'">
      <i class="material-icons">comment</i>
    </a>
    <a class="btn-floating blue actionButton waves-effect waves-light" v-tooltip:position="'Ask for guidance from an instructor.'">
      <i class="material-icons">live_help</i>
    </a>
    <div v-if="mastery && mastery.editing" class="col s12" style="margin-left:1em;">
      <v-text-input
        placeholder="Evidence of mastery."
        v-bind:name="'evidence' + standard.id"
        v-bind:id="'evidence' + standard.id">
      </v-text-input>
    </div>
  </div>
</template>

<script>
export default {
  name: 'evidence-buttons',
  props: ['mastery']
}
</script>
