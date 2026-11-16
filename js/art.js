/* Flat animal pictures. Same drawing is used big, as a choice, and on the sticker. */
(function () {
  const stroke = '#3a2e28';

  function eye(x, y, s) {
    return (
      '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<ellipse cx="0" cy="0" rx="11" ry="13" fill="#fff" stroke="' + stroke + '" stroke-width="4"/>' +
      '<circle cx="2" cy="2" r="6" fill="' + stroke + '"/>' +
      '<circle cx="4.5" cy="-1.5" r="2.2" fill="#fff"/>' +
      '</g>'
    );
  }

  function wrap(body) {
    return (
      '<svg viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="110" cy="156" rx="70" ry="8" fill="#ead9c2"/>' +
      body +
      '</svg>'
    );
  }

  const animals = {
    cow: function () {
      return wrap(
        '<g stroke="' + stroke + '" stroke-width="5" stroke-linejoin="round">' +
        '<ellipse cx="78" cy="108" rx="18" ry="10" fill="#f4f1ea"/>' +
        '<path d="M92 104c18 10 28 6 36-8" fill="none" stroke-linecap="round"/>' +
        '<rect x="58" y="112" width="12" height="32" rx="6" fill="#f4f1ea"/>' +
        '<rect x="92" y="116" width="12" height="28" rx="6" fill="#f4f1ea"/>' +
        '<rect x="126" y="116" width="12" height="28" rx="6" fill="#f4f1ea"/>' +
        '<ellipse cx="118" cy="100" rx="62" ry="38" fill="#f7f4ee"/>' +
        '<ellipse cx="96" cy="92" rx="14" ry="10" fill="#2c2c2c"/>' +
        '<ellipse cx="132" cy="112" rx="12" ry="9" fill="#2c2c2c"/>' +
        '<ellipse cx="150" cy="86" rx="10" ry="8" fill="#2c2c2c"/>' +
        '<circle cx="168" cy="78" r="32" fill="#f7f4ee"/>' +
        '<path d="M150 66 L146 30 L170 58 Z" fill="#d7be92"/>' +
        '<path d="M184 60 L206 28 L208 66 Z" fill="#d7be92"/>' +
        '<ellipse cx="198" cy="90" rx="16" ry="11" fill="#f3b7c4"/>' +
        '<circle cx="192" cy="90" r="2.2" fill="' + stroke + '"/>' +
        '<circle cx="202" cy="90" r="2.2" fill="' + stroke + '"/>' +
        '<path d="M178 108 h12 v10 a6 6 0 0 1 -12 0z" fill="#f0c14a"/>' +
        eye(160, 72, 1) +
        '</g>'
      );
    },
    dog: function () {
      return wrap(
        '<g stroke="' + stroke + '" stroke-width="5" stroke-linejoin="round">' +
        '<path d="M70 108c-24 8-30 28-8 32" fill="none" stroke="#c4843c" stroke-linecap="round" stroke-width="8"/>' +
        '<rect x="78" y="116" width="12" height="28" rx="6" fill="#e0a15a"/>' +
        '<rect x="108" y="118" width="12" height="26" rx="6" fill="#e0a15a"/>' +
        '<rect x="138" y="118" width="12" height="26" rx="6" fill="#e0a15a"/>' +
        '<ellipse cx="120" cy="104" rx="58" ry="34" fill="#e7ad62"/>' +
        '<ellipse cx="86" cy="70" rx="16" ry="26" fill="#c4843c"/>' +
        '<circle cx="162" cy="78" r="34" fill="#e7ad62"/>' +
        '<ellipse cx="188" cy="92" rx="20" ry="14" fill="#f0c48a"/>' +
        '<ellipse cx="196" cy="90" rx="8" ry="6" fill="#2c2c2c"/>' +
        '<path d="M188 100c6 12 16 12 20 2" fill="#e36b6b"/>' +
        eye(154, 70, 1.05) +
        '</g>'
      );
    },
    cat: function () {
      return wrap(
        '<g stroke="' + stroke + '" stroke-width="5" stroke-linejoin="round">' +
        '<path d="M150 112c28 8 40 28 22 36" fill="none" stroke="#e07a22" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M164 124c6 4 8 10 4 14" fill="none" stroke="#c45a18" stroke-width="4"/>' +
        '<rect x="86" y="118" width="11" height="26" rx="5" fill="#f29a3a"/>' +
        '<rect x="112" y="120" width="11" height="24" rx="5" fill="#f29a3a"/>' +
        '<rect x="136" y="120" width="11" height="24" rx="5" fill="#f29a3a"/>' +
        '<ellipse cx="118" cy="106" rx="52" ry="32" fill="#f29a3a"/>' +
        '<path d="M132 58l14-28 12 26z" fill="#f29a3a"/>' +
        '<path d="M168 56l12-26 14 28z" fill="#f29a3a"/>' +
        '<path d="M140 46l8-14 6 14z" fill="#f7b6c4"/>' +
        '<path d="M176 46l8-12 6 14z" fill="#f7b6c4"/>' +
        '<circle cx="164" cy="78" r="32" fill="#f29a3a"/>' +
        '<path d="M196 82h18M196 90h16M132 84h-16M132 92h-14" fill="none" stroke-linecap="round"/>' +
        '<path d="M156 96l8 6 8-6" fill="#f7b6c4"/>' +
        eye(150, 74, 1) +
        eye(176, 74, 1) +
        '</g>'
      );
    },
    duck: function () {
      return wrap(
        '<g stroke="' + stroke + '" stroke-width="5" stroke-linejoin="round">' +
        '<path d="M78 132h28l-6 12h-16z" fill="#f08a24"/>' +
        '<path d="M128 132h28l-6 12h-16z" fill="#f08a24"/>' +
        '<ellipse cx="112" cy="108" rx="58" ry="34" fill="#f6d34d"/>' +
        '<ellipse cx="96" cy="104" rx="22" ry="16" fill="#f3c431"/>' +
        '<circle cx="158" cy="74" r="30" fill="#f6d34d"/>' +
        '<path d="M176 78h32l-16 14z" fill="#f08a24"/>' +
        eye(150, 66, 1) +
        '</g>'
      );
    },
    horse: function () {
      return wrap(
        '<g stroke="' + stroke + '" stroke-width="5" stroke-linejoin="round">' +
        '<path d="M78 96c-8 20 4 40 2 48" fill="none" stroke="#5c3a24" stroke-width="8" stroke-linecap="round"/>' +
        '<rect x="92" y="116" width="12" height="30" rx="6" fill="#a56a3a"/>' +
        '<rect x="116" y="118" width="12" height="28" rx="6" fill="#a56a3a"/>' +
        '<rect x="146" y="118" width="12" height="28" rx="6" fill="#a56a3a"/>' +
        '<ellipse cx="124" cy="108" rx="52" ry="30" fill="#b87542"/>' +
        '<path d="M150 90c8-28 28-48 42-46 2 16-6 28-4 40 8 6 18 8 22 16-10 6-22 4-30 0-6 10-16 16-28 14z" fill="#b87542"/>' +
        '<path d="M168 52c6 10 4 22-2 32 8-6 14-16 12-28z" fill="#5c3a24"/>' +
        '<path d="M188 48c10 2 14 12 8 20" fill="#5c3a24"/>' +
        '<ellipse cx="198" cy="96" rx="10" ry="7" fill="#f4efe6"/>' +
        eye(176, 78, 0.9) +
        '</g>'
      );
    }
  };

  function star() {
    return (
      '<svg class="star" viewBox="0 0 100 100" aria-hidden="true">' +
      '<polygon points="50,6 62,38 96,38 68,58 78,92 50,72 22,92 32,58 4,38 38,38" fill="#f0c14a" stroke="#3a2e28" stroke-width="4" stroke-linejoin="round"/>' +
      '</svg>'
    );
  }

  window.Art = {
    animal: function (id) {
      return (animals[id] || animals.cow)();
    },
    star: star,
    ids: Object.keys(animals)
  };
})();
